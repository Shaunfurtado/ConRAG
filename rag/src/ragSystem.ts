// ragSystem.ts

import { DocumentLoader } from './documentLoader';
import { VectorStoreService } from './vectorStore';
import { LLMService } from './llmService';
import { DatabaseService } from './databaseService';
import { QueryResult } from './types';
import { Logger } from './logger';
import { Document } from './types';
import { Express } from 'express';

export class RAGSystem {
  private documentLoader: DocumentLoader;
  public vectorStore: VectorStoreService;
  private llmService: LLMService;
  public databaseService: DatabaseService;
  private logger: Logger;
  private sessionId: string;

  constructor() {
    this.documentLoader = new DocumentLoader();
    this.vectorStore = new VectorStoreService();
    this.llmService = new LLMService();
    this.databaseService = new DatabaseService();
    this.logger = Logger.getInstance();
    this.sessionId = this.databaseService.getSessionId();
  }

  async initialize(): Promise<void> {
    await this.logger.log('Initializing RAG system');
    await this.databaseService.initialize();
    await this.vectorStore.initialize(this.sessionId);
    await this.logger.log('RAG system initialization complete');
  }

  async saveDocuments(files: Express.Multer.File[]): Promise<void> {
    await this.logger.log('Processing document upload');

    try {
      // Load and chunk documents
      const documents = await this.documentLoader.loadDocuments(files);
      // Add documents to vector store
      await this.vectorStore.addBatchToVectorStore(documents);
      // Save document metadata to database
      const documentMetadata = files.map(file => ({
        file_name: file.originalname,
        file_path: file.path,
        session_id: this.sessionId,
        upload_time: new Date().toISOString()
      }));
      
      await this.databaseService.saveDocuments(documentMetadata);
      await this.logger.log('Documents saved successfully');
    } catch (error) {
      await this.logger.log('Error saving documents', error);
      throw new Error(`Failed to save documents: ${(error as Error).message}`);
    }
  }

  async query(question: string): Promise<QueryResult> {
    await this.logger.log('Processing query', { question });
  
    // Ensure the vector store is targeting the correct session
    await this.vectorStore.initialize(this.sessionId);
    try {
      // Generate query variations for better coverage
      const queryVariations = await this.generateQueryVariations(question);
      
      // Get relevant documents for each query variation
      const relevantDocsSet = new Set<Document>();
      const variations = await queryVariations;
      for (const query of variations) {
        const docs = await this.vectorStore.similaritySearch(query, 3);
        docs.forEach((doc: Document) => relevantDocsSet.add(doc));
      }
      const relevantDocs = Array.from(relevantDocsSet);
  
      // Get conversation history
      const history = await this.databaseService.getConversationHistory();
      
      // Generate context from relevant documents
      const context = this.generateContext(relevantDocs);
      
      // Create final prompt
      const prompt = this.createFinalPrompt(question, context, history);
      
      // Generate LLM response as a stream
      let answer = '';
      const response = await this.llmService.generateResponse(prompt);
      answer += response;
  
      // Save conversation
      await this.databaseService.saveConversation(question, answer);
      
      // Collect unique sources
      const sources = [...new Set(relevantDocs.map(doc => doc.metadata.source))];
      
      await this.logger.log('Query processed successfully');
      
      return { answer, sources };
    } catch (error) {
      await this.logger.log('Error processing query', error);
      throw new Error(`Failed to process query: ${(error as Error).message}`);
    }
  }
  

  private async generateQueryVariations(question: string): Promise<string[]> {
    // Initial templates for query variations
    const templates = [
      question,
      `key information about ${question}`,
      `main points regarding ${question}`
      // `explain ${question}`,
      // `details about ${question}`
    ];
  
    // Filter out variations that are too similar to the original question
    const variations = new Set<string>();
    variations.add(question); // Always include the original question
  
    for (const template of templates) {
      if (template.toLowerCase() !== question.toLowerCase()) {
        variations.add(template);
      }
    }
  
    // Optionally, use semantic similarity to filter nonsensical queries
    const validVariations: string[] = [];
    for (const variation of variations) {
      const isRelevant = await this.vectorStore.checkRelevance(question, variation); 
      // Assume `checkRelevance` is a method that uses embeddings or LLM to evaluate semantic similarity
      if (isRelevant) {
        validVariations.push(variation);
      }
    }
  
    return validVariations.length > 0 ? validVariations : [question]; // Fallback to the original question if no valid variations
  }

  private generateContext(documents: Document[]): string {
  // Sort by relevance score (descending)
  const sortedDocs = documents.sort((a, b) =>
    (b.metadata.score || 0) - (a.metadata.score || 0)
  );

  // Deduplicate documents by source
  const uniqueDocs = new Map<string, Document>();
  sortedDocs.forEach((doc) => {
      const source = doc.metadata.source;
      if (source && !uniqueDocs.has(source)) {
        uniqueDocs.set(source, doc);
      }
    });

  return Array.from(uniqueDocs.values())
    .map((doc) => {
      const metadata = doc.metadata;
      return `
        Source: ${metadata.source}
        Content:
        ${doc.pageContent}
        -------------------
        `;
    })
    .join('\n');
}

  private createFinalPrompt(
    question: string,
    context: string,
    history: { question: string; answer: string }[]
  ): string {
    const historyContext = this.formatConversationHistory(history);
  
    return `
  You are a highly intelligent and precise AI assistant. Your job is to answer the user's question with high accuracy and relevance using the provided context. If the information isn't available in the context, explicitly mention it.
  
  Context:
  ${context}
  
  Conversation History (last 3 exchanges):
  ${historyContext || "No relevant previous conversation."}
  
  Current Question:
  ${question}
  
  Guidelines for Your Answer:
  1. Base your answer only on the provided context and question.
  2. If the information isn't found in the context, state so instead of guessing.
  3. Incorporate relevant conversation history **only if it directly aids the current question.**
  4. Maintain conciseness and clarity in your responses.
  5. Cite sources (e.g., "Source: {source}") wherever applicable.
  
  Answer:
  `;
  }
  
  private formatConversationHistory(
    history: { question: string; answer: string }[]
  ): string {
    // Include only relevant recent exchanges
    const relevantHistory = history.slice(-3); // Keep the last 3 exchanges for brevity.
  
    if (relevantHistory.length === 0) return "No previous conversation.";
  
    return relevantHistory
      .map(
        (exchange, index) => `
  Conversation ${index + 1}:
  Q: ${exchange.question}
  A: ${exchange.answer}
  `
      )
      .join('\n');
  }
  
  async addDocumentsToVectorStore(documents: Document[], batchSize: number = 50): Promise<void> {
    await this.logger.log('Adding documents to vector store in batches');
    try {
        // Split documents into batches
        const totalDocuments = documents.length;
        for (let i = 0; i < totalDocuments; i += batchSize) {
            const batch = documents.slice(i, i + batchSize);
            await this.vectorStore.addBatchToVectorStore(batch);
            await this.logger.log(`Batch ${Math.floor(i / batchSize) + 1} added to vector store`);
        }
        await this.logger.log('All documents added to vector store successfully');
    } catch (error) {
        await this.logger.log('Error adding documents to vector store', error);
        throw new Error(`Failed to add documents to vector store: ${(error as Error).message}`);
    }
}

  async startNewConversation(): Promise<void> {
    await this.logger.log('Starting new conversation');
    try {
        this.sessionId = await this.databaseService.startNewSession();
        await this.vectorStore.initialize(this.sessionId);
        await this.logger.log('New conversation started', { sessionId: this.sessionId });
    } catch (error) {
        await this.logger.log('Error starting new conversation', error);
        throw new Error('Failed to start new conversation');
    }
}

  async switchConversation(sessionId: string): Promise<void> {
    await this.logger.log('Switching conversation', { sessionId });
    
    try {
      this.sessionId = sessionId;
      await this.databaseService.switchSession(sessionId);
      await this.vectorStore.initialize(sessionId);
      await this.logger.log('Switched conversation successfully');
    } catch (error) {
      await this.logger.log('Error switching conversation', error);
      throw new Error('Failed to switch conversation');
    }
  }

  async getDocumentNames(sessionId: string): Promise<{ file_name: string, file_path: string }[]> {
    try {
      return await this.databaseService.getDocumentNames(sessionId);
    } catch (error) {
      await this.logger.log('Error retrieving document names', error);
      throw new Error('Failed to retrieve document names');
    }
  }

  async switchModel(modelName: 'gemini' | 'ollama' | 'metaai'): Promise<void> {
    await this.logger.log('Switching LLM model', { modelName });
    
    try {
      await this.llmService.switchModel(modelName);
      await this.logger.log('Model switched successfully');
    } catch (error) {
      await this.logger.log('Error switching model', error);
      throw new Error('Failed to switch model');
    }
  }

  async getConversationHistory(): Promise<{ question: string; answer: string }[]> {
    try {
      return await this.databaseService.getConversationHistory();
    } catch (error) {
      await this.logger.log('Error retrieving conversation history', error);
      throw new Error('Failed to retrieve conversation history');
    }
  }
}
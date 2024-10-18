import { VectorStore } from './vectorStore';
import { LLMService } from './llmService';
import { DatabaseService } from './databaseService';
import { QueryResult } from './types';
import { Logger } from './logger';

interface Document {
  pageContent: string;
  metadata: { [key: string]: any };
}

export class RAGSystem {
  private vectorStore: VectorStore;
  private llmService: LLMService;
  private databaseService: DatabaseService;
  private logger: Logger;

  constructor() {
    this.vectorStore = new VectorStore();
    this.llmService = new LLMService();
    this.databaseService = new DatabaseService();
    this.logger = Logger.getInstance();
  }

  // Method to retrieve the document names for a specific session
  async getDocumentNames(sessionId: string): Promise<{ fileName: string }[]> {
    const documentNames = await this.databaseService.getDocumentNames(sessionId);
    return documentNames.map(doc => ({ fileName: doc.file_name }));
  }

  // Method to handle document uploads and saving them to the vector store and database
  async saveDocuments(documents: Document[], sessionId: string): Promise<void> {
    await this.logger.log('Saving uploaded documents');
    // Save document metadata and contents to the database
    const documentMetadata = documents.map(doc => ({
      file_name: doc.metadata.file_name,
      file_path: doc.metadata.file_path,
      content: doc.pageContent,
    }));
    await this.databaseService.saveDocuments(documentMetadata);
    
    // Add documents to the vector store for similarity search
    await this.vectorStore.addDocuments(documents);
  }

  // Method to switch between conversations by session ID
  async switchConversation(sessionId: string): Promise<void> {
    await this.logger.log(`Switching to session: ${sessionId}`);
    this.databaseService.switchSession(sessionId);
  }

  async getConversationHistory(): Promise<{ question: string; answer: string }[]> {
    return this.databaseService.getConversationHistory();
  }

  // Method to start a new conversation session
  async startNewConversation(): Promise<void> {
    await this.logger.log('Starting a new conversation session');
    this.databaseService.startNewSession(); // Reset session ID in the DatabaseService
  }

  async initialize(documents: Document[]): Promise<void> {
    await this.logger.log('Initializing RAG system');
    await this.vectorStore.initialize(documents);
    await this.databaseService.initialize();
    await this.logger.log('RAG system initialization complete');
  }

  async query(question: string): Promise<QueryResult> {
    await this.logger.log('Processing query', { question });

    // Step 1: Retrieve relevant documents
    const relevantDocs = await this.vectorStore.similaritySearch(question, 3);
    await this.logger.log('Relevant documents retrieved', { count: relevantDocs.length });

    // Step 2: Rerank documents and generate context
    const documentContext = this.generateContext(relevantDocs);

    // Step 3: Fetch conversation history for context
    const conversationHistory = await this.databaseService.getConversationHistory();

    // Step 4: Create optimized prompt using the context and history
    const finalPrompt = this.createFinalPrompt(question, documentContext, conversationHistory);

    // Step 5: Get the final response from the LLM
    const answer = await this.llmService.generateResponse(finalPrompt);

    await this.databaseService.saveConversation(question, answer);

    return {
      answer,
      sources: relevantDocs.map(doc => doc.metadata.source),
    };
  }

  // Method to switch LLM models dynamically
  async switchModel(modelName: 'gemini' | 'ollama'): Promise<void> {
    await this.logger.log(`Switching to model: ${modelName}`);
    this.llmService.switchModel(modelName); // Add logic in LLMService to switch models
  }

  // Method to handle smaller document chunks
  private generateContext(docs: Document[]): string {
    return docs.map(doc => doc.pageContent).join('\n\n');
  }

  private createFinalPrompt(question: string, documentContext: string, conversationHistory: { question: string; answer: string }[]): string {
    const historyContext = this.formatConversationHistory(conversationHistory);
    
    return `Use the following information to answer the question. If the information is not sufficient, say so.

Relevant information from documents:
${documentContext}

${historyContext}

Current question: ${question}

Answer:`;
  }

  private formatConversationHistory(history: { question: string; answer: string }[]): string {
    if (history.length === 0) {
      return "No previous conversation context.";
    }

    const historyContext = history.map((turn, index) => 
      `Turn ${index + 1}:
Q: ${turn.question}
A: ${turn.answer}`
    ).join('\n\n');

    return `Previous conversation context:
${historyContext}`;
  }

  // Method to add LLM API key
  async addLLMApiKey(keyName: string, apiKey: string): Promise<void> {
    // Implementation for adding LLM API key
    console.log(`API key for ${keyName} added.`);
  }
}

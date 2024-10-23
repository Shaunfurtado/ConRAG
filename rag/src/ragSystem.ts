// rag\src\ragSystem.ts
import { VectorStore } from './vectorStore';
import { LLMService } from './llmService';
import { DatabaseService } from './databaseService';
import { QueryResult } from './types';
import { Logger } from './logger';
import { Express } from 'express'; // Import Express types
import * as fs from 'fs'; // Import fs module

interface Document {
  pageContent: string;
  metadata: { [key: string]: any };
}

export class RAGSystem {
  public vectorStore: VectorStore;
  private llmService: LLMService;
  public databaseService: DatabaseService;
  private logger: Logger;
  private sessionId: string;

  constructor() {
    this.vectorStore = new VectorStore();
    this.llmService = new LLMService();
    this.databaseService = new DatabaseService();
    this.logger = Logger.getInstance();
    this.sessionId = this.databaseService.getSessionId();  // Set session ID from the database service
  }

  // Method to retrieve the document names for a specific session
  async getDocumentNames(sessionId: string): Promise<{ file_name: string, file_path: string }[]> {
    const documentNames = await this.databaseService.getDocumentNames(sessionId);
    return documentNames.map(doc => ({
      file_name: doc.file_name,
      file_path: doc.file_path,
    }));
  }

  // Method to handle document uploads and saving them to the vector store and database
  async saveDocuments(files: Express.Multer.File[]): Promise<void> {
    await this.logger.log('Saving uploaded documents');

    const documents = await this.loadDocuments(files.map(file => ({
      file_path: file.path,
      metadata: { source: file.originalname }
    })));

    // **Get the current session ID** (reuse the same session ID across uploads)
    const sessionId = this.databaseService.getSessionId();

    // Save document metadata (file name, file path) to the database using the current session ID
    const documentMetadata = files.map(file => ({
      file_name: file.originalname,
      file_path: file.path  // Store the file path
    }));
    await this.databaseService.saveDocuments(documentMetadata);  // Save metadata under the same session ID

    // Add documents to the vector store for similarity search
    await this.vectorStore.addDocuments(documents);
  }

  // Method to switch between conversations by session ID
  async switchConversation(sessionId: string): Promise<void> {
    await this.logger.log(`Switching to session: ${sessionId}`);

    // Switch the session ID in the RAGSystem
    this.databaseService.switchSession(sessionId);
    this.sessionId = sessionId;

    // **Switch to the new collection for the new session**
    await this.vectorStore.switchSession(sessionId);

    // Fetch and load documents for the new session
    const documentPaths = await this.databaseService.getDocumentNames(sessionId);
    const documents = await this.loadDocuments(documentPaths.map(doc => ({
      file_path: doc.file_path,
      metadata: { source: doc.file_name }
    })));

    // Add documents to the vector store for this session
    await this.vectorStore.addDocuments(documents);

    await this.logger.log(`Switched to session: ${sessionId}`);
  }
  async getConversationHistory(): Promise<{ question: string; answer: string }[]> {
    return this.databaseService.getConversationHistory();
  }

  /// Method to start a new conversation session
  async startNewConversation(): Promise<void> {
    await this.logger.log('Starting a new conversation session');

    // Generate a new session ID
    this.databaseService.startNewSession();
    this.sessionId = this.databaseService.getSessionId();  // Update the sessionId in RAGSystem

    // **Create a new collection for the new session in the vector store**
    await this.vectorStore.initialize([], this.sessionId);

    await this.logger.log(`New conversation session started with sessionId: ${this.sessionId}`);
  }
  async initialize(documents: Document[]): Promise<void> {
    await this.logger.log('Initializing RAG system');

    // Ensure that VectorStore is initialized before adding documents
    if (!this.vectorStore.isInitialized()) {
      await this.vectorStore.initialize(documents);
    }

    await this.databaseService.initialize();
    await this.logger.log('RAG system initialization complete');
  }

  // Method to add documents to the vector store
  async addDocumentsToVectorStore(documents: Document[]): Promise<void> {
    await this.logger.log('Adding documents to vector store');

    // Ensure VectorStore is initialized
    if (!this.vectorStore.isInitialized()) {
      await this.vectorStore.initialize(documents);  // Initialize if not already done
    } else {
      await this.vectorStore.addDocuments(documents);  // Adds documents dynamically
    }

    await this.logger.log('Documents added to vector store');
  }

  async query(question: string): Promise<QueryResult> {
    await this.logger.log('Processing query', { question });

    // Step 1: Fetch document metadata for this session (file paths and names)
    const existingDocuments = await this.databaseService.getDocumentNames(this.databaseService.getSessionId());

    if (existingDocuments.length > 0) {
      // Load the documents from file paths and regenerate embeddings
      const documents = await this.loadDocuments(existingDocuments.map(doc => ({
        file_path: doc.file_path,
        metadata: { source: doc.file_path }
      })));
      await this.vectorStore.addDocuments(documents);  // Add regenerated embeddings to vector store
    }

    // Step 2: Retrieve relevant documents
    const relevantDocs = await this.vectorStore.similaritySearch(question, 3);
    await this.logger.log('Relevant documents retrieved', { count: relevantDocs.length });

    // Step 3: Rerank documents and generate context
    const documentContext = this.generateContext(relevantDocs);

    // Step 4: Fetch conversation history for context
    const conversationHistory = await this.databaseService.getConversationHistory();

    // Step 5: Create optimized prompt using the context and history
    const finalPrompt = this.createFinalPrompt(question, documentContext, conversationHistory);

    // Step 6: Get the final response from the LLM
    const answer = await this.llmService.generateResponse(finalPrompt);

    await this.databaseService.saveConversation(question, answer);

    return {
      answer,
      sources: relevantDocs.map(doc => doc.metadata.source),  // Use metadata source here
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

  // Method to load documents from files
  private async loadDocuments(files: { file_path: string; metadata: { source: string } }[]): Promise<Document[]> {
    return Promise.all(files.map(async file => {
      const content = await fs.promises.readFile(file.file_path, 'utf-8');  // Load file content from the file path
      return {
        pageContent: content,  // Use the content for vector embedding
        metadata: { source: file.metadata.source }
      };
    }));
  }
}

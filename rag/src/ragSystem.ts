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

  async getConversationHistory(): Promise<{ question: string; answer: string }[]> {
    return this.databaseService.getConversationHistory();
  }

  // New method to start a new conversation session
  async startNewConversation(): Promise<void> {
    await this.logger.log('Starting a new conversation session');
    this.databaseService.startNewSession();  // This method will reset the session ID in the DatabaseService
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

  // Modify generateContext to handle smaller document chunks
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
}

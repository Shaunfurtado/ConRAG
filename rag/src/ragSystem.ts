import { VectorStore } from './vectorStore';
import { LLMService } from './llmService';
import { Document } from 'langchain/document';
import { QueryResult } from './types';
import { Logger } from './logger';

export class RAGSystem {
  private vectorStore: VectorStore;
  private llmService: LLMService;
  private logger: Logger;

  constructor() {
    this.vectorStore = new VectorStore();
    this.llmService = new LLMService();
    this.logger = Logger.getInstance();
  }

  async initialize(documents: Document[]): Promise<void> {
    await this.logger.log('Initializing RAG system');
    await this.vectorStore.initialize(documents);
    await this.logger.log('RAG system initialization complete');
  }

  async query(question: string): Promise<QueryResult> {
    await this.logger.log('Processing query', { question });

    const relevantDocs = await this.vectorStore.similaritySearch(question, 3);
    await this.logger.log('Relevant documents retrieved', { count: relevantDocs.length });

    const context = relevantDocs.map(doc => doc.pageContent).join('\n\n');
    const prompt = `Context: ${context}\n\nQuestion: ${question}\n\nAnswer:`;

    const answer = await this.llmService.generateResponse(prompt);

    const result: QueryResult = {
      answer,
      sources: relevantDocs.map(doc => doc.metadata.source as string),
    };

    await this.logger.log('Query processed', { result });
    return result;
  }
}
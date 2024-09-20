// rag\src\ragSystem.ts
import { VectorStore } from './vectorStore';
import { LLMService } from './llmService';
import { Document, QueryResult } from './types';

export class RAGSystem {
  private vectorStore: VectorStore;
  private llmService: LLMService;

  constructor() {
    this.vectorStore = new VectorStore();
    this.llmService = new LLMService();
  }

  async initialize(documents: Document[]) {
    console.log('Initializing vector store...');
    await this.vectorStore.initialize();
    console.log('Adding documents to vector store...');
    await this.vectorStore.addDocuments(documents);
    console.log('Vector store initialization complete.');
  }

  async query(question: string): Promise<QueryResult> {
    console.log('Performing similarity search...');
    const relevantDocs = await this.vectorStore.similaritySearch(question, 3);
    console.log(`Found ${relevantDocs.length} relevant documents.`);

    console.log('Preparing context for LLM...');
    const context = relevantDocs.map(doc => doc.pageContent).join('\n\n');
    const prompt = `Context: ${context}\n\nQuestion: ${question}\n\nAnswer:`;

    console.log('Sending prompt to LLM for answer generation...');
    const answer = await this.llmService.generateResponse(prompt);
    console.log('Answer received from LLM.');

    return {
      answer,
      sources: relevantDocs.map(doc => doc.metadata.source),
    };
  }
}

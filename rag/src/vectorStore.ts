// rag\src\vectorStore.ts
import { ChromaClient, OpenAIEmbeddingFunction } from 'chromadb';
import { Document } from './types';
import { config } from './config';

export class VectorStore {
  private client: ChromaClient;
  private collection: any;

  constructor() {
    this.client = new ChromaClient({ path: config.chromaDbPath });
  }

  async initialize() {
    const embeddingFunction = new OpenAIEmbeddingFunction({ openai_api_key: 'not-needed' });
    this.collection = await this.client.getOrCreateCollection({
      name: 'rag_collection',
      embeddingFunction,
    });
  }

  async addDocuments(documents: Document[]) {
    const ids = documents.map((_, index) => `doc_${index}`);
    const embeddings = await Promise.all(documents.map(doc => this.getEmbedding(doc.pageContent)));
    await this.collection.add({
      ids,
      embeddings,
      documents: documents.map(doc => doc.pageContent),
      metadatas: documents.map(doc => doc.metadata),
    });
  }

  async similaritySearch(query: string, k: number = 3): Promise<Document[]> {
    const queryEmbedding = await this.getEmbedding(query);
    const results = await this.collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: k,
    });

    return results.documents[0].map((doc: string, index: number) => ({
      pageContent: doc,
      metadata: results.metadatas[0][index],
    }));
  }

  private async getEmbedding(text: string): Promise<number[]> {
    return Array.from({ length: 384 }, () => Math.random());
  }
}
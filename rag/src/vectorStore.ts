import { ChromaClient, Collection } from 'chromadb';
import { v4 as uuidv4 } from 'uuid';
import { config } from './config';
import { Logger } from './logger';

interface Document {
  pageContent: string;
  metadata: { [key: string]: any };
}

export class VectorStore {
  private client: ChromaClient;
  private collection: Collection | null = null;
  private logger: Logger;
  private sessionId: string;

  constructor() {
    this.client = new ChromaClient({ path: config.chromaDbPath });
    this.logger = Logger.getInstance();
    this.sessionId = uuidv4();
  }

  async initialize(documents: Document[]): Promise<void> {
    await this.logger.log('Initializing vector store');

    try {
      const collectionName = `rag_collection_${this.sessionId}`;
      this.collection = await this.client.createCollection({
        name: collectionName,
      });

      await this.addDocuments(documents);

      await this.logger.log('Vector store initialized successfully');
    } catch (error) {
      await this.logger.log('Error initializing vector store', error);
      throw new Error(`Failed to initialize vector store: ${(error as Error).message}`);
    }
  }

  private async addDocuments(documents: Document[]): Promise<void> {
    if (!this.collection) {
      throw new Error('Collection not initialized');
    }

    try {
      const ids = documents.map((_, index) => `doc_${index}`);
      const embeddings = await Promise.all(documents.map(doc => this.getEmbedding(doc.pageContent)));
      const metadatas = documents.map(doc => doc.metadata);

      await this.collection.add({
        ids,
        embeddings,
        documents: documents.map(doc => doc.pageContent),
        metadatas,
      });

      await this.logger.log('Documents added to the vector store');
    } catch (error) {
      await this.logger.log('Error adding documents to the vector store', error);
      throw new Error(`Failed to add documents: ${(error as Error).message}`);
    }
  }

  async similaritySearch(query: string, k: number = 3): Promise<Document[]> {
    await this.logger.log('Performing similarity search', { query, k });

    if (!this.collection) {
      throw new Error('Collection not initialized');
    }

    try {
      const queryEmbedding = await this.getEmbedding(query);

      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: k,
      });

      await this.logger.log('Similarity search completed', { resultCount: results.documents?.[0]?.length || 0 });

      if (!results.documents || !results.documents[0] || results.documents[0].length === 0) {
        await this.logger.log('No results found in similarity search');
        return [];
      }

      return results.documents[0].map((doc, index) => ({
        pageContent: doc || '',
        metadata: results.metadatas?.[0]?.[index] || {},
      }));
    } catch (error) {
      await this.logger.log('Error in similarity search', error);
      throw new Error(`Failed to perform similarity search: ${(error as Error).message}`);
    }
  }

  private async getEmbedding(text: string): Promise<number[]> {
    // This is a placeholder. In a real implementation, you would use an actual embedding model.
    return Array.from({ length: 384 }, () => Math.random());
  }
}
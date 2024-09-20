import { ChromaClient, Collection } from 'chromadb'; // Use chromadb client directly
import { config } from './config';
import { Logger } from './logger';

// Define a custom Document interface
interface Document {
  pageContent: string;
  metadata: { [key: string]: any };
}

export class VectorStore {
  private client: ChromaClient;
  private collection: Collection | null = null;
  private logger: Logger;

  constructor() {
    this.client = new ChromaClient({ path: config.chromaDbPath }); // Initialize the Chroma client with the specified path
    this.logger = Logger.getInstance(); // Get the logger instance
  }

  // Initialize the vector store with documents
  async initialize(documents: Document[]): Promise<void> {
    await this.logger.log('Initializing vector store');

    try {
      await this.logger.log('Creating or loading Chroma collection');
      
      // Get or create the collection
      this.collection = await this.client.getOrCreateCollection({
        name: 'rag_coll',
      });

      await this.logger.log('Collection initialized. Adding documents to the vector store');

      // Add documents to the collection
      await this.addDocuments(documents);

      await this.logger.log('Vector store initialized successfully');
    } catch (error) {
      await this.logger.log('Error initializing vector store', error);
      throw new Error(`Failed to initialize vector store: ${(error as Error).message}`);
    }
  }

  // Add documents to the Chroma collection
  private async addDocuments(documents: Document[]): Promise<void> {
    if (!this.collection) {
      const error = new Error('Collection not initialized');
      await this.logger.log('Error adding documents', error);
      throw error;
    }

    try {
      // Prepare data for insertion into Chroma
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

  // Perform similarity search on the vector store
  async similaritySearch(query: string, k: number = 3): Promise<Document[]> {
    await this.logger.log('Performing similarity search', { query, k });

    if (!this.collection) {
      const error = new Error('Collection not initialized');
      await this.logger.log('Error in similarity search', error);
      throw error;
    }

    try {
      // Get embedding for the query
      const queryEmbedding = await this.getEmbedding(query);

      // Perform the similarity search
      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: k,
      });

      await this.logger.log('Similarity search completed', { resultCount: results.documents?.[0]?.length || 0 });

      // Format and return the results
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

  // Generate embeddings for a given text
  private async getEmbedding(text: string): Promise<number[]> {
    // You can replace this placeholder with an actual embedding generation logic
    // For example, use an external API or a local model to get the embeddings

    // This is just a placeholder implementation. Replace with actual embedding logic.
    return Array(384).fill(0); // Placeholder embedding of 384 dimensions
  }
}

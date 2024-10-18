import { ChromaClient, Collection } from 'chromadb';
import { v4 as uuidv4 } from 'uuid';
import { config } from './config';
import { Logger } from './logger';
import { Document } from './types';

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

  // Initialize vector store and create or load the collection for the current session
  async initialize(documents: Document[], sessionId?: string): Promise<void> {
    this.sessionId = sessionId || this.sessionId;
    await this.logger.log(`Initializing vector store for session: ${this.sessionId}`);

    try {
      const collectionName = `rag_collection_${this.sessionId}`;
      const existingCollection = await this.client.listCollections();
      const collectionExists = existingCollection.some(col => col.name === collectionName);

      if (collectionExists) {
        await this.logger.log(`Loading existing collection: ${collectionName}`);
        this.collection = await this.client.getCollection({ name: collectionName });
      } else {
        await this.logger.log(`Creating new collection: ${collectionName}`);
        this.collection = await this.client.createCollection({ name: collectionName });
        await this.addDocuments(documents);
      }

      await this.logger.log('Vector store initialized successfully');
    } catch (error) {
      await this.logger.log('Error initializing vector store', error);
      throw new Error(`Failed to initialize vector store: ${(error as Error).message}`);
    }
  }

  // Switch to a different session, which involves switching the collection
  async switchSession(sessionId: string): Promise<void> {
    this.sessionId = sessionId;
    await this.logger.log(`Switching to session: ${sessionId}`);
    const collectionName = `rag_collection_${this.sessionId}`;
    const existingCollection = await this.client.listCollections();
    const collectionExists = existingCollection.some(col => col.name === collectionName);

    if (collectionExists) {
      this.collection = await this.client.getCollection({ name: collectionName });
      await this.logger.log(`Loaded collection for session: ${sessionId}`);
    } else {
      throw new Error(`Collection for session ${sessionId} does not exist`);
    }
  }

  // Add documents and their embeddings to the vector store collection
  async addDocuments(documents: Document[]): Promise<void> {
    if (!this.collection) {
      throw new Error('Collection not initialized');
    }

    try {
      const ids = documents.map((_, index) => `doc_${index}`);
      const embeddings = await Promise.all(documents.map(doc => this.getEmbedding(doc.pageContent)));  // Embed once

      const metadatas = documents.map(doc => doc.metadata);

      // Store document embeddings in Chroma collection
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

  // Search for similar documents based on query embedding
  async similaritySearch(query: string, k: number = 3): Promise<Document[]> {
    await this.logger.log('Performing similarity search', { query, k });

    if (!this.collection) {
      throw new Error('Collection not initialized');
    }

    try {
      const queryEmbedding = await this.getEmbedding(query);  // Generate embedding for the query

      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: k,  // Retrieve top k relevant results from all documents
      });

      await this.logger.log('Similarity search completed', { resultCount: results.documents?.[0]?.length || 0 });

      if (!results.documents || !results.documents[0] || results.documents[0].length === 0) {
        await this.logger.log('No results found in similarity search');
        return [];
      }

      // Return top-ranked documents from all sources
      const filteredDocs = results.documents[0].filter((doc): doc is string => doc !== null);
      const scores = (results as any).scores ? (results as any).scores[0] : [];
      const rankedResults = this.rerankResults(filteredDocs, scores);

      return rankedResults.map((doc, index) => ({
        pageContent: doc || '',
        metadata: results.metadatas?.[0]?.[index] || {},
      }));
    } catch (error) {
      await this.logger.log('Error in similarity search', error);
      throw new Error(`Failed to perform similarity search: ${(error as Error).message}`);
    }
  }

  // Get embedding from an external API
  private async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch('http://localhost:5000/embed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data; // Return the embedding received from Flask API
    } catch (error) {
      console.error('Error fetching embeddings:', error);
      throw new Error('Failed to fetch embeddings');
    }
  }

  // Rerank the results based on their scores
  private rerankResults(docs: string[], scores: number[]): string[] {
    return docs.sort((a, b) => scores[docs.indexOf(b)] - scores[docs.indexOf(a)]);
  }
}

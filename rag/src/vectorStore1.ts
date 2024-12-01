// // rag\src\vectorStore.ts
import { ChromaClient, Collection, OllamaEmbeddingFunction } from 'chromadb';
import { v4 as uuidv4 } from 'uuid';
import { Document } from './types';
import { Logger } from './logger';
import { Graph } from './graph';
import { config } from './config';
import { DocumentMetadata } from './documentLoader';

export class VectorStoreService {
  private client: ChromaClient;
  private collection: Collection | null = null;
  private logger: Logger;
  private sessionId: string;
  public graph: Graph;

  constructor() {
    this.client = new ChromaClient({ path: config.chromaDbPath });
    this.logger = Logger.getInstance();
    this.sessionId = uuidv4();
    this.graph = new Graph();
  }

  async initialize(sessionId?: string): Promise<void> {
    this.sessionId = sessionId || this.sessionId;
    const collectionName = `rag_collection_${this.sessionId}`;

    try {
      // Use OllamaEmbeddingFunction
      const embedder = new OllamaEmbeddingFunction({
        url: 'http://127.0.0.1:11434/api/embeddings', // Ollama's API endpoint
        // model: 'nomic-embed-text', // Model name for embeddings
        // model: 'bge-large', // Model name for embeddings
        model: 'mxbai-embed-large', // Model name for embeddings
      });

      this.collection = await this.client.getOrCreateCollection({
        name: collectionName,
        embeddingFunction: embedder,
        metadata: {
          'hnsw:space': 'cosine',
          'hnsw:construction_ef': 100,
          'hnsw:search_ef': 100,
        },
      });
    } catch (error) {
      await this.logger.log('Error initializing vector store', error);
      throw error;
    }
  }

  async addBatchToVectorStore(batch: Document[]): Promise<void> {
    if (!this.collection) throw new Error('Collection not initialized');

    const ids = batch.map((doc) =>
      `${doc.metadata.documentId}_chunk${doc.metadata.chunkIndex}`
    );

    const metadatas = batch.map((doc) => ({
      ...doc.metadata,
      embedCreatedAt: new Date().toISOString(),
    }));

    await this.collection.add({
      ids,
      documents: batch.map((doc) => doc.pageContent),
      metadatas,
    });

    // Add document relationships to the graph
    batch.forEach((doc) => {
      const { documentId, source } = doc.metadata as DocumentMetadata;
      this.graph.addNode(documentId, source);
    });
  }

  async similaritySearch(query: string, k: number = 5): Promise<Document[]> {
    if (!this.collection) throw new Error('Collection not initialized');

    const results = await this.collection.query({
      queryTexts: [query], // OllamaEmbeddingFunction handles embeddings
      nResults: k * 2,
      where: {}, // Query across all documents in collection
    });

    if (!results.documents?.[0]) return [];

    const documents = results.documents[0];
    const metadatas = results.metadatas[0];
    const distances = results.distances?.[0] ?? [];

    // Group results by document ID and combine relevant chunks
    const documentGroups = new Map<string, Document[]>();

    documents.forEach((content, index) => {
      const metadata = metadatas[index] as unknown as DocumentMetadata;
      const { documentId } = metadata;

      if (!documentGroups.has(documentId)) {
        documentGroups.set(documentId, []);
      }

      documentGroups.get(documentId)?.push({
        pageContent: content ?? '',
        metadata: {
          ...metadata,
          score: distances[index],
        },
      });
    });

    // Sort and select top documents based on average chunk scores
    const topDocuments = Array.from(documentGroups.values())
      .map((chunks) => {
        const avgScore =
          chunks.reduce((sum, doc) => sum + (doc.metadata.score || 0), 0) /
          chunks.length;
        return {
          chunks,
          avgScore,
        };
      })
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, k)
      .flatMap((doc) => doc.chunks);

    // Call refineResults with only the topDocuments parameter
    return this.graph.refineResults(topDocuments);
  }
}

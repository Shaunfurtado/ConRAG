import { ChromaClient, Collection } from 'chromadb';
import { v4 as uuidv4 } from 'uuid';
import { Document } from './types';
import { Logger } from './logger';
import { Graph } from './graph';
import { config } from './config';
import { DocumentMetadata } from './documentLoader';
import { BM25Retriever } from '@langchain/community/retrievers/bm25';

export class VectorStoreService {
  private client: ChromaClient;
  private collection: Collection | null = null;
  private logger: Logger;
  private sessionId: string;
  public graph: Graph;
  private bm25Retriever: BM25Retriever | null = null;

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
      this.collection = await this.client.getOrCreateCollection({ 
        name: collectionName,
        metadata: { 
          "hnsw:space": "cosine",
          "hnsw:construction_ef": 100,
          "hnsw:search_ef": 100
        }
      });

      // Initialize BM25 retriever with documents from the current collection
      const documents = await this.getAllDocuments();
      this.bm25Retriever = BM25Retriever.fromDocuments(documents, { k: 10 });

    } catch (error) {
      await this.logger.log('Error initializing vector store', error);
      throw error;
    }
  }

  async addBatchToVectorStore(batch: Document[]): Promise<void> {
    if (!this.collection) throw new Error('Collection not initialized');

    const ids = batch.map(doc => 
        `${doc.metadata.documentId}_chunk${doc.metadata.chunkIndex}`
    );
    
    const embeddings = await Promise.all(
        batch.map(doc => this.getEmbedding(doc.pageContent))
    );

    const metadatas = batch.map(doc => ({
        ...doc.metadata,
        embedCreatedAt: new Date().toISOString()
    }));

    await this.collection.add({
        ids,
        embeddings,
        documents: batch.map(doc => doc.pageContent),
        metadatas
    });

    // Add document relationships to the graph
    batch.forEach(doc => {
        const { documentId, source } = doc.metadata as DocumentMetadata;
        this.graph.addNode(documentId, source);
    });

    // Update BM25 retriever
    this.bm25Retriever = BM25Retriever.fromDocuments(batch, { k: 10 });
  }

  async hybridSearch(query: string, k: number = 5): Promise<Document[]> {
    if (!this.collection) throw new Error('Collection not initialized');

    // Step 1: Vector similarity search
    const queryEmbedding = await this.getEmbedding(query);
    const vectorResults = await this.collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: k * 2,
      where: {}, // Query across all documents in collection
    });

    if (!vectorResults.documents?.[0]) return [];

    const vectorDocs = vectorResults.documents[0].map((content, index) => ({
      pageContent: content ?? '',
      metadata: vectorResults.metadatas[0][index]
    }));

    // Step 2: BM25 reranking
    const rerankedDocs = this.bm25Retriever
      ? await this.bm25Retriever.invoke(query)
      : vectorDocs;

    // Step 3: Combine results with Graph-based refinement
    const validDocs = rerankedDocs.slice(0, k).filter(doc => doc.metadata !== null) as Document[];
    const refinedResults = this.graph.refineResults(validDocs);
    return refinedResults;
  }

  private async getAllDocuments(): Promise<Document[]> {
    if (!this.collection) throw new Error('Collection not initialized');
  
    try {
      // Fetch all documents from the current active collection
      const allDocs = await this.collection.get();
      
      // Map the retrieved documents and metadata into the expected Document structure
      return (allDocs.documents || []).map((doc: string | null, index: number) => ({
        pageContent: doc ?? '',
        metadata: allDocs.metadatas && allDocs.metadatas[index] ? allDocs.metadatas[index] : {}
      }));
    } catch (error) {
      this.logger.log('Error fetching all documents from the collection', error);
      return [];
    }
  }
  

  public checkRelevance(query: string, documentContent: string): boolean {
    const queryTokens = query.toLowerCase().split(/\W+/);
    const docTokens = documentContent.toLowerCase().split(/\W+/);
  
    const querySet = new Set(queryTokens);
    const docSet = new Set(docTokens);
  
    const commonTokens = Array.from(querySet).filter(token => docSet.has(token));
    const relevanceThreshold = 0.2; // Adjust this value as needed
  
    return commonTokens.length / queryTokens.length >= relevanceThreshold;
  }

  public async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch('http://localhost:5000/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) throw new Error('Embedding API failed');
      return await response.json();
    } catch (error) {
      throw new Error('Failed to fetch embeddings');
    }
  }
}

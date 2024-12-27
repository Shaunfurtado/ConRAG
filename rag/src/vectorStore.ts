import { MilvusClient, DataType, DataTypeMap} from '@zilliz/milvus2-sdk-node';
import { hexoid } from 'hexoid';
import { Document } from './types';
import { Logger } from './logger';
import { Graph } from './graph';
import { DocumentMetadata } from './documentLoader';
import { BM25Retriever } from '@langchain/community/retrievers/bm25';

// Define collection schema types
interface CollectionSchema {
  id: string;
  vector: number[];
  text_content: string;
  document_id: string;
  chunk_index: number;
  source: string;
  created_at: string;
  [key: string]: any; // Index signature for type 'string'
}

export class VectorStoreService {
  private client: MilvusClient;
  private collectionName: string | null = null;
  private logger: Logger;
  private sessionId: string;
  public graph: Graph;
  private bm25Retriever: BM25Retriever | null = null;
  private readonly vectorDim = 768; // Dimension of your embedding model

  constructor() {
    this.client = new MilvusClient({
      address: 'localhost:19530',
      ssl: false,
    });
    this.logger = Logger.getInstance();
    this.sessionId = hexoid()();
    this.graph = new Graph();
  }

  async initialize(sessionId?: string): Promise<void> {
    this.sessionId = sessionId || this.sessionId;
    this.logger.log(`Initializing vector store with session ID: ${this.sessionId}`);
    this.collectionName = `rag_collection_${this.sessionId}`;
    
    try {
      // Check if collection exists
      const existsResponse = await this.client.hasCollection({
        collection_name: this.collectionName
      });
      const exists = existsResponse.value ? existsResponse.value : null;
      await this.logger.log(`Collection ${this.collectionName} exists: ${exists}`);

      if (!exists) {
        // Create collection with schema
        await this.client.createCollection({
          collection_name: this.collectionName,
          schema: [
            {
              name: 'id',
              description: 'ID field',
              data_type: DataType.VarChar,
              is_primary_key: true,
              max_length: 100
            },
            {
              name: 'vector',
              description: 'Vector embeddings',
              data_type: DataType.FloatVector,
              dim: this.vectorDim
            },
            {
              name: 'text_content',
              description: 'Original text content',
              data_type: DataType.VarChar,
              max_length: 65535
            },
            {
              name: 'document_id',
              description: 'Document ID',
              data_type: DataType.VarChar,
              max_length: 100
            },
            {
              name: 'chunk_index',
              description: 'Chunk index within document',
              data_type: DataType.Int64
            },
            {
              name: 'source',
              description: 'Source of the document',
              data_type: DataType.VarChar,
              max_length: 500
            },
            {
              name: 'created_at',
              description: 'Timestamp of creation',
              data_type: DataType.VarChar,
              max_length: 100
            }
          ],
          enable_dynamic_field: true
        });

        // Create index for vector field
        await this.client.createIndex({
          collection_name: this.collectionName,
          field_name: 'vector',
          extra_params: {
            index_type: 'IVF_FLAT',
            metric_type: 'COSINE',
            params: JSON.stringify({ nlist: 1024 }) // Convert params object to JSON string
          }
        });

        // Create index for text search
        await this.client.createIndex({
          collection_name: this.collectionName,
          field_name: 'text_content',
          index_name: 'text_index',
          extra_params: {
            index_type: 'FULLTEXT',
            metric_type: 'COSINE',
            params: JSON.stringify({})
          }
        });
      }

      // Load collection into memory
      await this.client.loadCollection({
        collection_name: this.collectionName
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
    if (!this.collectionName) throw new Error('Collection not initialized');

    const entities: CollectionSchema[] = await Promise.all(
      batch.map(async (doc) => {
        const embedding = await this.getEmbedding(doc.pageContent);
        return {
          id: `${doc.metadata.documentId}_chunk${doc.metadata.chunkIndex}`,
          vector: embedding,
          text_content: doc.pageContent,
          document_id: doc.metadata.documentId || '',
          chunk_index: doc.metadata.chunkIndex,
          source: doc.metadata.source || '',
          created_at: new Date().toISOString()
        };
      })
    );

    await this.client.insert({
      collection_name: this.collectionName,
      data: entities
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
    if (!this.collectionName) throw new Error('Collection not initialized');

    // Step 1: Vector similarity search
    const queryEmbedding = await this.getEmbedding(query);
    
    // Hybrid search using both vector and text
    const searchResults = await this.client.search({
      collection_name: this.collectionName,
      vector: queryEmbedding,
      vectors: [],
      output_fields: ['text_content', 'document_id', 'chunk_index', 'source', 'created_at'],
      limit: k * 2,
      search_params: {
        anns_field: 'vector',
        metric_type: 'COSINE',
        params: JSON.stringify({ nprobe: 10 }),
        topk: k * 2,
      },
      expr: `text_content like '%${query}%'` // Basic text matching
    });

    // Convert results to Document format
    const vectorDocs = searchResults.results.map(result => ({
      pageContent: result.text_content,
      metadata: {
        documentId: result.document_id,
        chunkIndex: result.chunk_index,
        source: result.source,
        score: result.score,
        embedCreatedAt: result.created_at
      }
    }));

    // Step 2: BM25 reranking if available
    const rerankedDocs = this.bm25Retriever
      ? await this.bm25Retriever.invoke(query)
      : vectorDocs;

    // Step 3: Combine results with Graph-based refinement
    const validDocs = rerankedDocs.slice(0, k).filter(doc => doc.metadata !== null) as Document[];
    const refinedResults = this.graph.refineResults(validDocs);
    
    return refinedResults;
  }

  private async getAllDocuments(): Promise<Document[]> {
    if (!this.collectionName) throw new Error('Collection not initialized');
  
    try {
      const queryResult = await this.client.query({
        collection_name: this.collectionName,
        output_fields: ['text_content', 'document_id', 'chunk_index', 'source', 'created_at'],
        expr: '',
        limit: 10000 // Adjust based on your needs
      });

      return queryResult.data.map(doc => ({
        pageContent: doc.text_content,
        metadata: {
          documentId: doc.document_id,
          chunkIndex: doc.chunk_index,
          source: doc.source,
          embedCreatedAt: doc.created_at
        }
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
    const relevanceThreshold = 0.2;
  
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

  async cleanup(): Promise<void> {
    if (this.collectionName) {
      try {
        await this.client.dropCollection({
          collection_name: this.collectionName
        });
      } catch (error) {
        this.logger.log('Error cleaning up collection', error);
      }
    }
  }
}
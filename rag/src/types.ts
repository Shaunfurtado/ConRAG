export interface Document {
  pageContent: string;
  metadata: {
    [key: string]: any;
    source?: string;
    documentId?: string;  // Added to support graph operations
  };
}

export interface QueryResult {
  answer: string;
  sources: (string | undefined)[];
}

export interface GraphNode {
  id: string;
  content: string;
}

export interface GraphEdge {
  source: string;
  target: string;
}

// Updated Graph interface to match implementation
export interface Graph {
  addNode(id: string, content: string): void;
  addEdge(source: string, target: string): void;
  refineResults(docs: Document[]): Document[];  // Updated to use Document type
  clear(): void;
}
// rag\src\graph.ts
import { Document, GraphNode, GraphEdge } from './types';

export class Graph {
  private adjacencyList: Map<string, Set<string>>;

  constructor() {
    this.adjacencyList = new Map();
  }

  addNode(id: string, content: string): void {
    if (!this.adjacencyList.has(id)) {
      this.adjacencyList.set(id, new Set());
    }
  }

  addEdge(source: string, target: string): void {
    if (this.adjacencyList.has(source)) {
      this.adjacencyList.get(source)?.add(target);
    }
  }

  // Updated to handle Document type input and output
  refineResults(docs: Document[]): Document[] {
    // Create a map to store document lookup by ID
    const docMap = new Map<string, Document>();
    
    // Create a map of document IDs to their neighbor counts
    const neighborCounts = new Map<string, number>();
    
    // Process each document
    docs.forEach(doc => {
      const docId = doc.metadata.documentId;
      if (docId) {
        docMap.set(docId, doc);
        neighborCounts.set(docId, this.adjacencyList.get(docId)?.size || 0);
      }
    });

    // Sort documents by neighbor count
    return Array.from(docMap.values()).sort((a, b) => {
      const aId = a.metadata.documentId!;
      const bId = b.metadata.documentId!;
      const aNeighbors = neighborCounts.get(aId) || 0;
      const bNeighbors = neighborCounts.get(bId) || 0;
      return bNeighbors - aNeighbors; // Descending order by neighbor count
    });
  }

  clear(): void {
    this.adjacencyList.clear();
  }
}
export type { GraphNode, GraphEdge };
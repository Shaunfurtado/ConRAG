// rag\src\types.ts
export interface Document {
  pageContent: string;
  metadata: {
    [key: string]: any;
  };
}

export interface QueryResult {
  answer: string;
  sources: string[];
}

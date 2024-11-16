// rag\src\documentLoader.ts
import fs from 'fs/promises';
import { Document } from 'langchain/document';
import { Logger } from './logger';
import { Express } from 'express';

export interface DocumentMetadata {
  source: string;
  documentId: string;
  chunkIndex: number;
  totalChunks: number;
}

export class DocumentLoader {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  // Function to chunk document with metadata
  private chunkDocument(content: string, documentId: string, source: string, chunkSize: number = 200): Document[] {
    const chunks: Document[] = [];
    const words = content.split(/\s+/);
    const totalChunks = Math.ceil(words.length / chunkSize);
    
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunkContent = words.slice(i, i + chunkSize).join(' ');
      const metadata: DocumentMetadata = {
        source,
        documentId,
        chunkIndex: Math.floor(i / chunkSize),
        totalChunks
      };
      
      chunks.push(new Document({
        pageContent: chunkContent,
        metadata
      }));
    }
    
    return chunks;
  }

  async loadDocuments(files: Express.Multer.File[]): Promise<Document[]> {
    await this.logger.log('Loading documents from file uploads', { files: files.map(f => f.originalname) });

    const documents: Document[] = [];

    for (const file of files) {
      if (!file.path) {
        throw new Error(`File path is undefined for file: ${file.originalname}`);
      }

      const content = await fs.readFile(file.path, 'utf-8');
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const chunks = this.chunkDocument(content, documentId, file.originalname);
      documents.push(...chunks);
    }

    await this.logger.log('Documents loaded and chunked successfully', { count: documents.length });
    return documents;
  }
}

const documentLoader = new DocumentLoader();
export const loadDocuments = documentLoader.loadDocuments.bind(documentLoader);
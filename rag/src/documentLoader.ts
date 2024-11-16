// rag\src\documentLoader.ts
import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
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
  private chunkDocument(content: string, documentId: string, source: string, chunkSize: number = 400, overlap: number = 75): Document[] {
    const chunks: Document[] = [];
    const words = content.split(/\s+/);
    const totalChunks = Math.ceil((words.length - overlap) / (chunkSize - overlap));

    for (let i = 0; i < words.length; i += chunkSize - overlap) {
        const chunkContent = words.slice(i, i + chunkSize).join(' ');
        const metadata: DocumentMetadata = {
            source,
            documentId,
            chunkIndex: Math.floor(i / (chunkSize - overlap)),
            totalChunks
        };

        chunks.push(new Document({
            pageContent: chunkContent,
            metadata
        }));

        // Stop if the remaining words are fewer than chunkSize
        if (i + chunkSize >= words.length) break;
    }

    return chunks;
}

  // Function to process individual files
  private async processFile(file: Express.Multer.File): Promise<Document[]> {
    const { originalname, path, mimetype } = file;
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let content: string;

    await this.logger.log(`Processing file: ${originalname} (MIME type: ${mimetype})`);

    if (mimetype === 'text/plain') {
      // Handle plain text files
      content = await fs.readFile(path, 'utf-8');
    } else if (mimetype === 'application/pdf') {
      // Handle PDF files
      const fileBuffer = await fs.readFile(path);
      const pdfData = await pdfParse(fileBuffer);
      content = pdfData.text;
    } else {
      throw new Error(`Unsupported file type: ${mimetype} for file: ${originalname}`);
    }

    await this.logger.log(`File content successfully extracted: ${originalname}`);

    // Chunk the document and return
    return this.chunkDocument(content, documentId, originalname);
  }

  // Function to load and process all files
  async loadDocuments(files: Express.Multer.File[]): Promise<Document[]> {
    await this.logger.log('Loading documents from file uploads', { files: files.map(f => f.originalname) });

    const documents: Document[] = [];

    for (const file of files) {
      if (!file.path) {
        throw new Error(`File path is undefined for file: ${file.originalname}`);
      }

      try {
        const chunks = await this.processFile(file);
        documents.push(...chunks);
      } catch (error) {
        await this.logger.log(`Error processing file: ${file.originalname}`, { error });
        throw error; // Rethrow the error for upstream handling
      }
    }

    await this.logger.log('Documents loaded and chunked successfully', { count: documents.length });
    return documents;
  }
}

const documentLoader = new DocumentLoader();
export const loadDocuments = documentLoader.loadDocuments.bind(documentLoader);

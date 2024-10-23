// rag\src\documentLoader.ts
import fs from 'fs/promises';
import { Document } from 'langchain/document';
import { Logger } from './logger';
import { Express } from 'express';

// Function to chunk document into smaller pieces (paragraphs, sentences, or pages)
function chunkDocument(content: string, chunkSize: number = 200): string[] {
  const chunks: string[] = [];
  const words = content.split(/\s+/);
  
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }
  
  return chunks;
}

export async function loadDocuments(files: Express.Multer.File[]): Promise<Document[]> {
  const logger = Logger.getInstance();
  await logger.log('Loading documents from file uploads', { files: files.map(f => f.originalname) });

  const documents: Document[] = [];

  for (const file of files) {
    if (!file.path) {
      throw new Error(`File path is undefined for file: ${file.originalname}`);
    }

    const content = await fs.readFile(file.path, 'utf-8');
    const documentChunks = chunkDocument(content);
    const docChunks = documentChunks.map((chunk, index) => new Document({
      pageContent: chunk,
      metadata: { source: file.originalname, path: file.path, chunk: index },
    }));
    documents.push(...docChunks);
  }

  await logger.log('Documents loaded and chunked successfully', { count: documents.length });
  return documents;
}
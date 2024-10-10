// rag\src\documentLoader.ts
import fs from 'fs/promises';
import { Document } from 'langchain/document';
import { config } from './config';
import { Logger } from './logger';

// Function to chunk document into smaller pieces (paragraphs, sentences, or pages)
function chunkDocument(content: string, chunkSize: number = 200): string[] {
  const chunks: string[] = [];
  const words = content.split(/\s+/);
  
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }
  
  return chunks;
}

export async function loadDocument(): Promise<Document[]> {
  const logger = Logger.getInstance();
  await logger.log('Loading document');

  const content = await fs.readFile(config.documentPath, 'utf-8');
  
  // Split document into chunks for better embedding and retrieval
  const documentChunks = chunkDocument(content);
  const documents = documentChunks.map((chunk, index) => new Document({
    pageContent: chunk,
    metadata: { source: config.documentPath, chunk: index },
  }));

  await logger.log('Document loaded and chunked successfully');
  return documents;
}

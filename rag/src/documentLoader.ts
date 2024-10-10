// rag\src\documentLoader.ts
import fs from 'fs/promises';
import { Document } from 'langchain/document';
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

export async function loadDocuments(paths: string[]): Promise<Document[]> {
  const logger = Logger.getInstance();
  await logger.log('Loading documents from paths', { paths });

  const documents: Document[] = [];

  for (const path of paths) {
    const content = await fs.readFile(path, 'utf-8');
    const documentChunks = chunkDocument(content);
    const docChunks = documentChunks.map((chunk, index) => new Document({
      pageContent: chunk,
      metadata: { source: path, chunk: index },
    }));
    documents.push(...docChunks);
  }

  await logger.log('Documents loaded and chunked successfully', { count: documents.length });
  return documents;
}

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

export async function loadDocuments(files: (Express.Multer.File | { file_path: string, metadata: { source: string } })[]): Promise<Document[]> {
  const logger = Logger.getInstance();
  await logger.log('Loading documents from files', { files });

  const documents: Document[] = [];

  for (const file of files) {
    let content: string;
    let source: string;

    if ('buffer' in file) {
      content = file.buffer.toString('utf-8');
      source = file.originalname;
    } else {
      content = await fs.readFile(file.file_path, 'utf-8');
      source = file.metadata.source;
    }

    const documentChunks = chunkDocument(content);
    const docChunks = documentChunks.map((chunk, index) => new Document({
      pageContent: chunk,
      metadata: { source, chunk: index },
    }));
    documents.push(...docChunks);
  }

  await logger.log('Documents loaded and chunked successfully', { count: documents.length });
  return documents;
}
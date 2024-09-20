// rag\src\documentLoader.ts
import fs from 'fs/promises';
import { Document } from './types';
import { config } from './config';

export async function loadDocument(): Promise<Document[]> {
  const content = await fs.readFile(config.documentPath, 'utf-8');
  return [
    {
      pageContent: content,
      metadata: { source: config.documentPath },
    },
  ];
}

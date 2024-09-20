import fs from 'fs/promises';
import { Document } from 'langchain/document';
import { config } from './config';
import { Logger } from './logger';

export async function loadDocument(): Promise<Document[]> {
  const logger = Logger.getInstance();
  await logger.log('Loading document');

  const content = await fs.readFile(config.documentPath, 'utf-8');
  const document = new Document({
    pageContent: content,
    metadata: { source: config.documentPath },
  });

  await logger.log('Document loaded successfully');
  return [document];
}
// src/config.ts
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  chromaDbPath: process.env.CHROMA_DB_PATH || './chromadb',
  documentPath: process.env.DOCUMENT_PATH || './docs/logs.txt',
  logPath: process.env.LOG_PATH || './logs/conversation_logs.json'
};
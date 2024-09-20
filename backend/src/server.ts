import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { RAGSystem } from '../../rag/src/ragSystem';
import { loadDocument } from '../../rag/src/documentLoader';
import path from 'path';
import fs from 'fs/promises';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let ragSystem: RAGSystem;

interface Query {
  id: string;
  question: string;
  answer?: string;
  status: 'pending' | 'completed';
}

const queries: Map<string, Query> = new Map();
const conversations: Map<string, string[]> = new Map();

(async () => {
  ragSystem = new RAGSystem();
  const documents = await loadDocument();
  await ragSystem.initialize(documents);
  console.log('RAG system initialized');
})();

app.post('/query', async (req, res) => {
  const { question, sessionId } = req.body;
  if (!question || !sessionId) {
    return res.status(400).json({ error: 'Question and sessionId are required' });
  }

  const queryId = uuidv4();
  const query: Query = { id: queryId, question, status: 'pending' };
  queries.set(queryId, query);

  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, []);
  }
  conversations.get(sessionId)!.push(queryId);

  // Process query asynchronously
  processQuery(queryId, sessionId);

  res.json({ queryId });
});

app.get('/reply/:queryId', (req, res) => {
  const { queryId } = req.params;
  const query = queries.get(queryId);

  if (!query) {
    return res.status(404).json({ error: 'Query not found' });
  }

  if (query.status === 'pending') {
    return res.json({ status: 'pending' });
  }

  res.json({ status: 'completed', answer: query.answer });
});

app.get('/conversation/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const conversationQueries = conversations.get(sessionId) || [];
  const conversationHistory = conversationQueries.map(queryId => {
    const query = queries.get(queryId);
    return query ? { question: query.question, answer: query.answer } : null;
  }).filter(q => q !== null);

  res.json(conversationHistory);
});

app.get('/conversations', (req, res) => {
  const allConversations = Array.from(conversations.entries()).map(([sessionId, queryIds]) => ({
    sessionId,
    queryCount: queryIds.length
  }));

  res.json(allConversations);
});

app.get('/documents', async (req, res) => {
  try {
    const docsFolder = path.join(__dirname, '../../rag/docs');
    const files = await fs.readdir(docsFolder);
    const documents = files.filter(file => file.endsWith('.txt') || file.endsWith('.pdf'));
    res.json(documents);
  } catch (error) {
    console.error('Error reading documents:', error);
    res.status(500).json({ error: 'Failed to retrieve documents' });
  }
});

app.post('/upload', async (req, res) => {
  // This is a placeholder for future implementation
  res.status(501).json({ message: 'Document upload not implemented yet' });
});

async function processQuery(queryId: string, sessionId: string) {
  const query = queries.get(queryId);
  if (!query) return;

  try {
    const result = await ragSystem.query(query.question);
    query.answer = result.answer;
    query.status = 'completed';
    queries.set(queryId, query);
  } catch (error) {
    console.error('Error processing query:', error);
    query.answer = 'An error occurred while processing the query.';
    query.status = 'completed';
    queries.set(queryId, query);
  }
}
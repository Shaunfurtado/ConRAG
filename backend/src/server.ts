import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

import { RAGSystem } from '../../rag/src/ragSystem';
import { loadDocument } from '../../rag/src/documentLoader';

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

interface ProcessedQuery {
  question: string;
  answer: string | undefined;
}

const queries: Map<string, Query> = new Map();
const conversations: Map<string, string[]> = new Map();

// Initialize RAG system asynchronously
(async () => {
  try {
    ragSystem = new RAGSystem();
    const documents = await loadDocument();
    await ragSystem.initialize(documents);
    console.log('RAG system initialized');
  } catch (error) {
    console.error('Error initializing RAG system:', error);
  }
})();

// Create a query
app.post('/query', async (req: Request, res: Response) => {
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

  // Process the query asynchronously
  processQuery(queryId, sessionId);

  return res.json({ queryId });
});

// Fetch a specific reply by query ID
app.get('/reply/:queryId', (req: Request, res: Response) => {
  const { queryId } = req.params;
  const query = queries.get(queryId);

  if (!query) {
    return res.status(404).json({ error: 'Query not found' });
  }

  if (query.status === 'pending') {
    return res.json({ status: 'pending' });
  }

  return res.json({ status: 'completed', answer: query.answer });
});

// Get conversation history by session ID
app.get('/conversation/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const conversationQueries = conversations.get(sessionId) || [];

  const conversationHistory: ProcessedQuery[] = conversationQueries
    .map(queryId => {
      const query = queries.get(queryId);
      return query ? { question: query.question, answer: query.answer } : null;
    })
    .filter(q => q !== null) as ProcessedQuery[];

  return res.json(conversationHistory);
});

// Get all conversations
app.get('/conversations', (req: Request, res: Response) => {
  const allConversations = Array.from(conversations.entries()).map(([sessionId, queryIds]) => ({
    sessionId,
    queryCount: queryIds.length
  }));

  return res.json(allConversations);
});

// Get list of documents
app.get('/documents', async (req: Request, res: Response) => {
  try {
    const docsFolder = path.join(__dirname, '../../rag/docs');
    const files = await fs.readdir(docsFolder);
    const documents = files.filter(file => file.endsWith('.txt') || file.endsWith('.pdf'));

    return res.json(documents);
  } catch (error) {
    console.error('Error reading documents:', error);
    return res.status(500).json({ error: 'Failed to retrieve documents' });
  }
});

// Upload a new document (to be implemented)
app.post('/upload', (req: Request, res: Response) => {
  // Placeholder for future implementation
  return res.status(501).json({ message: 'Document upload not implemented yet' });
});

// Function to process a query asynchronously
async function processQuery(queryId: string, sessionId: string) {
  const query = queries.get(queryId);
  if (!query) return;

  try {
    const result = await ragSystem.query(query.question);
    query.answer = result.answer;
    query.status = 'completed';
  } catch (error) {
    console.error('Error processing query:', error);
    query.answer = 'An error occurred while processing the query.';
    query.status = 'completed';
  }

  queries.set(queryId, query);
}

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

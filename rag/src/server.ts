// rag/src/server.ts
import express, { Request, Response } from 'express';
import fs from 'fs';
import { RAGSystem } from './ragSystem';
import { loadDocuments } from './documentLoader';
import { DatabaseService } from './databaseService';
import { Logger } from './logger';
import cors from 'cors';
import multer from 'multer';
import session from 'express-session';

const app = express();
const port = 3001;
app.use(cors());
app.use(express.json());
app.use(session({
  secret: 'your-secret-key', // Replace with your secret key
  resave: false,
  saveUninitialized: true,
}));
app.use(express.json());

let ragSystem: RAGSystem | null = null; // Initialize ragSystem as null

const databaseService = new DatabaseService();
(async () => {
  await databaseService.initialize();
})();

async function initializeRAGSystem(files: Express.Multer.File[]): Promise<void> {
  const logger = Logger.getInstance();
  await logger.log('Starting RAG system initialization');

  try {
      // Check if RAG system is already initialized
      if (!ragSystem) {
          // Initialize the RAG system only if it's not already initialized
          ragSystem = new RAGSystem();
          await ragSystem.databaseService.initialize(); // Ensure database is initialized
      }

      if (!files || files.length === 0) {
          throw new Error('No files provided for initialization');
      }

      await logger.log('File upload complete. Preparing to process files.');

      // Load documents from uploaded files
      const documents = await loadDocuments(files); // This function should handle txt and pdf files

      // Log after documents are loaded
      await logger.log(`${documents.length} documents successfully loaded.`);

      // **Get the current session ID from the RAGSystem**
      const sessionId = ragSystem.databaseService.getSessionId();
      await ragSystem.vectorStore.initialize(sessionId);

      // Save document metadata to the database using the current session ID
      const documentMetadata = files.map(file => ({
          file_name: file.originalname,
          file_path: file.path
      }));
      await ragSystem.databaseService.saveDocuments(documentMetadata); // Save metadata under the same session ID

      await logger.log('Starting to add documents to the vector store.');

      // Add documents to the vector store for similarity search
      await ragSystem.addDocumentsToVectorStore(documents);

      await logger.log('Documents successfully added to the vector store.');
      await logger.log('RAG system initialized successfully');
  } catch (error) {
      await logger.log('Error initializing RAG system', error);
      throw new Error(`Failed to initialize RAG system: ${(error as Error).message}`);
  }
}

// Endpoint to handle user queries
app.post('/query', async (req: Request, res: Response) => {
    const logger = Logger.getInstance();
    const { question } = req.body;
  
    // Check if RAG system is initialized
    if (!ragSystem) {
      return res.status(503).json({ error: 'RAG system is still initializing. Please try again later.' });
    }
  
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
  
    await logger.log('Processing user question', { question });
  
    try {
      const result = await ragSystem.query(question);
      await logger.log('Question processed successfully', { result });
  
      res.json({
        answer: result.answer,
        sources: result.sources,
      });
    } catch (error) {
      await logger.log('Error processing question', error);
      console.error('Error occurred while processing the question:', error);
      res.status(500).json({ error: 'An error occurred while processing your question' });
    }
});

// Endpoint to start a new conversation
app.post('/new-conversation', async (req: Request, res: Response) => {
  // Check if RAG system is initialized
  if (!ragSystem) {
    return res.status(503).json({ error: 'RAG system is still initializing. Please try again later.' });
  }
  
  try {
    await ragSystem.startNewConversation(); // Start a new conversation
    res.json({ message: 'New conversation started' });
  } catch (error) {
    const logger = Logger.getInstance();
    await logger.log('Error starting new conversation', error);
    res.status(500).json({ error: 'Failed to start a new conversation' });
  }
});

// Endpoint to retrieve document names for a specific session
app.get('/documents/:sessionId', async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  try {
    const rows = await ragSystem?.getDocumentNames(sessionId);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve document names' });
  }
});

// Endpoint to retrieve all session IDs from the database
app.get('/sessions', async (req: Request, res: Response) => {
  const logger = Logger.getInstance();
  
  try {
    const sessionIds = await databaseService.getAllSessionIds(); // Await the async call
    res.json({ sessionIds });
  } catch (error) {
    await logger.log('Error retrieving session IDs', error);
    res.status(500).json({ error: 'Failed to retrieve session IDs' });
  }
});

// Endpoint to switch conversations based on session ID
app.post('/switch-conversation/:sessionId', async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  try {
    await ragSystem?.switchConversation(sessionId);
    res.json({ message: `Switched to session: ${sessionId}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to switch conversation' });
  }
});

const upload = multer({
  dest: 'data/uploads/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
  fileFilter: (req, file, cb) => {
      const allowedMimeTypes = ['text/plain', 'application/pdf'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(null, false);
      }
      cb(null, true);
  }
});

app.post('/upload', upload.array('files'), async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  try {
    // **Reuse the current session**, don't create a new one
    if (!ragSystem) {
      // Initialize the RAG system if it's not already initialized
      ragSystem = new RAGSystem();
      await ragSystem.databaseService.initialize();  // Ensure database is initialized
    }

    // Upload documents and link them to the existing session
    await initializeRAGSystem(files);

    res.json({ message: 'Files uploaded and added to the current session successfully' });
  } catch (error) {
    console.error('Error during file upload and RAG initialization:', error);
    res.status(500).json({ error: 'Failed to upload files and initialize RAG system' });
  }
});

app.post('/switch-llm-model', async (req: Request, res: Response) => {
  const { modelName } = req.body;
  
  // Validate the model name
  if (modelName !== 'gemini' && modelName !== 'ollama' && modelName !== 'metaai') {
    return res.status(400).json({ error: 'Invalid model name. Use "gemini" or "ollama".' });
  }

  try {
    await ragSystem?.switchModel(modelName); // Switch the model based on the request
    res.json({ message: `Switched to model: ${modelName}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to switch model' });
  }
});


// Start the Express server
app.listen(port, () => {
  console.log(`RAG system server running at http://localhost:${port}`);
});
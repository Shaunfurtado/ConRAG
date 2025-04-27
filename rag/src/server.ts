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
import { ProfileType } from './types/profile';

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
const logger = Logger.getInstance(); // Get logger instance

// Initialize Database Service and RAG System on startup
(async () => {
  const databaseService = new DatabaseService(); // Keep database service instance accessible if needed elsewhere
  try {
    await databaseService.initialize();
    logger.log('Database service initialized successfully.');

    ragSystem = new RAGSystem(databaseService); // Pass databaseService instance
    await ragSystem.initialize(); // Initialize RAG system components
    logger.log('RAG System initialized successfully on server start.');

  } catch (error) {
    logger.log('FATAL: Failed to initialize Database or RAG System on startup.', error);
    // Optionally, prevent the server from starting or handle the error appropriately
    process.exit(1); // Example: Exit if core components fail to initialize
  }
})();


// Modified function to process documents for the *already initialized* RAG system
async function processUploadedDocuments(files: Express.Multer.File[]): Promise<void> {
  if (!ragSystem) {
    // This should ideally not happen if startup initialization is successful
    throw new Error('RAG system is not available.');
  }
  await logger.log('Processing uploaded files.');

  try {
    if (!files || files.length === 0) {
      throw new Error('No files provided for processing');
    }

    await logger.log('File upload complete. Preparing to process files.');

    // Load documents from uploaded files
    const documents = await loadDocuments(files);
    await logger.log(`${documents.length} documents successfully loaded.`);

    // Get the current session ID from the RAGSystem's database service
    const sessionId = ragSystem.databaseService.getSessionId();
    // Ensure vector store is initialized for the current session (might be redundant if initialize does it)
    await ragSystem.vectorStore.initialize(sessionId);

    // Save document metadata to the database using the current session ID
    const documentMetadata = files.map(file => ({
      file_name: file.originalname,
      file_path: file.path
      // session_id is handled by databaseService.saveDocuments using its current sessionId
    }));
    await ragSystem.databaseService.saveDocuments(documentMetadata);

    await logger.log('Starting to add documents to the vector store.');
    await ragSystem.addDocumentsToVectorStore(documents);

    await logger.log('Uploaded documents successfully processed and added.');

  } catch (error) {
    await logger.log('Error processing uploaded documents', error);
    // Rethrow or handle as appropriate for the endpoint
    throw new Error(`Failed to process uploaded documents: ${(error as Error).message}`);
  }
}

// Endpoint to handle user queries
app.post('/query', async (req: Request, res: Response) => {
    const logger = Logger.getInstance();
    const { question } = req.body;
  
    // Check if RAG system is initialized (still a good check in case of startup failure)
    if (!ragSystem) {
      // Updated error message reflecting startup initialization
      return res.status(503).json({ error: 'RAG system is not available. Initialization might have failed.' });
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
    return res.status(503).json({ error: 'RAG system is not available. Initialization might have failed.' });
  }
  
  try {
    // Make sure startNewConversation returns the new session ID
    const newSessionId = await ragSystem.startNewConversation();
    res.json({ message: 'New conversation started', sessionId: newSessionId }); // Return the new ID
  } catch (error) {
    const logger = Logger.getInstance();
    await logger.log('Error starting new conversation', error);
    res.status(500).json({ error: 'Failed to start a new conversation' });
  }
});


app.get('/documents', async (req: Request, res: Response) => {
  try {
    // Check if the RAG system is initialized
    if (!ragSystem) {
      return res.status(503).json({ error: 'RAG system is not available. Initialization might have failed.' });
    }

    // Retrieve the current session ID
    const sessionId = ragSystem.databaseService.getSessionId();

    // Ensure the session ID is valid
    if (!sessionId) {
      return res.status(400).json({ error: 'No active session found' });
    }

    // Fetch document names using the current session ID
    const rows = await ragSystem.getDocumentNames(sessionId);

    // Respond with the document names
    res.json(rows);
  } catch (error) {
    // Log the error properly
    await logger.log('Error retrieving documents', error);
    res.status(500).json({ error: 'Failed to retrieve document names' });
  }
});




app.post('/switch-profile', async (req: Request, res: Response) => {
  const { profileName } = req.body;
  
  if (!ragSystem) {
    return res.status(503).json({ error: 'RAG system not initialized' });
  }

  try {
    await ragSystem.switchProfile(profileName as ProfileType);
    res.json({ message: `Switched to profile: ${profileName}` });
  } catch (error) {
    const logger = Logger.getInstance();
    await logger.log('Error switching profile', error);
    res.status(400).json({ error: `Failed to switch profile: ${(error as Error).message}` });
  }
});


// Endpoint to retrieve document names for a specific session
// app.get('/documents/:sessionId', async (req: Request, res: Response) => {
//   const { sessionId } = req.params;
//   try {
//     const rows = await ragSystem?.getDocumentNames(sessionId);
//     res.json(rows);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to retrieve document names' });
//   }
// });

// Endpoint to retrieve all session IDs from the database
app.get('/sessions', async (req: Request, res: Response) => {
  const logger = Logger.getInstance();
  
  try {
    const sessionIds = await ragSystem?.databaseService.getAllSessionIds(); // Await the async call
    res.json({ sessionIds });
  } catch (error) {
    await logger.log('Error retrieving session IDs', error);
    res.status(500).json({ error: 'Failed to retrieve session IDs' });
  }
});

// Endpoint to switch conversations based on session ID
app.post('/switch-conversation/:sessionId', async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  if (!ragSystem) {
     return res.status(503).json({ error: 'RAG system is not available. Initialization might have failed.' });
  }
  try {
    await ragSystem.switchConversation(sessionId);
    res.json({ message: `Switched to session: ${sessionId}` });
  } catch (error) {
    await logger.log('Error switching conversation', error);
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

  if (!ragSystem) {
    return res.status(503).json({ error: 'RAG system is not available. Initialization might have failed.' });
  }

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  try {
    // RAG system is already initialized, just process the documents
    await processUploadedDocuments(files);

    res.json({ message: 'Files uploaded and processed successfully for the current session' });
  } catch (error) {
    // Use logger for server-side error logging
    await logger.log('Error during file upload processing', error);
    res.status(500).json({ error: `Failed to upload files: ${(error as Error).message}` });
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

// Endpoint to retrieve all conversations for a given session ID
app.get('/conversations/:sessionId', async (req: Request, res: Response) => {
   // It uses databaseService directly, which is initialized at startup.
   // Consider if ragSystem instance should provide access or if direct use is intended.
   // Assuming direct use is okay for now.
  const { sessionId } = req.params;

  try {
    // Ensure databaseService is available (it should be if startup succeeded)
     const databaseService = ragSystem?.databaseService; // Get from initialized ragSystem
     if (!databaseService) {
        return res.status(503).json({ error: 'Database service is not available.' });
     }
     const conversations = await databaseService.getConversationHistoryBySessionId(sessionId);
     res.json({ conversations });
   } catch (error) {
     await logger.log(`Error retrieving conversations for session ${sessionId}`, error);
     res.status(500).json({ error: 'Failed to retrieve conversations' });
   }
});

// Add endpoint to get current session ID (useful for frontend)
app.get('/current-session', (req: Request, res: Response) => {
  if (!ragSystem) {
    return res.status(503).json({ error: 'RAG system is not available.' });
  }
  const sessionId = ragSystem.databaseService.getSessionId();
  if (!sessionId) {
     return res.status(404).json({ error: 'No active session found.' });
  }
  res.json({ sessionId });
});

// Render index.html on root path
app.get('/', (req: Request, res: Response) => {
  res.sendFile(__dirname + '/ConRAG.html');
  logger.log(`Server root URL is accessible at http://localhost:${port}`);
});

app.listen(port, () => {
  logger.log(`Server listening on port ${port}`);
});
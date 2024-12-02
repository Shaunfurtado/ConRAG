// rag\src\databaseService.ts
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from './logger';

interface ConversationTurn {
  question: string;
  answer: string;
}

interface DocumentMetadata {
  file_name: string;
  file_path: string;
  content: string;
}

export class DatabaseService {
  public db: Database | null = null;
  private logger: Logger;
  private sessionId: string = '';
  private sessionIds: string[] = [];

  constructor() {
    this.logger = Logger.getInstance();
    this.sessionId = uuidv4();
    this.sessionIds.push(this.sessionId);
  }

  // Method to get the current session ID
  getSessionId(): string {
    return this.sessionId;  // Return the session ID
  }

  // Method to reset or start a new session
  startNewSession(): Promise<string> {
    this.sessionId = uuidv4();  // Generate a new session ID
    this.sessionIds.push(this.sessionId);
    this.logger.log(`New session started with sessionId: ${this.sessionId}`);
    return Promise.resolve(this.sessionId);  // Return the new session ID
  }

  // Method to switch to an existing session
  switchSession(sessionId: string): void {
    this.sessionId = sessionId;
    this.logger.log(`Switched to session: ${this.sessionId}`);
  }

  async initialize(): Promise<void> {
    try {
      this.db = await open({
        filename: './rag_conversations.db',
        driver: sqlite3.Database
      });

      if (!this.db) {
        throw new Error('Failed to open database');
      }

      // Table for storing conversation turns
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS conversations (
          id TEXT PRIMARY KEY,
          session_id TEXT,
          question TEXT,
          answer TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Table for storing document metadata and content
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY,
          session_id TEXT,
          file_name TEXT,
          file_path TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.logger.log('Database initialized successfully');
    } catch (error) {
      await this.logger.log('Error initializing database', error);
      throw new Error(`Failed to initialize database: ${(error as Error).message}`);
    }
  }

  // Method to fetch all unique session IDs from the database
  public async fetchAllSessionIdsFromDatabase(): Promise<string[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
  
    try {
      const rows = await this.db.all(`
        SELECT session_id
        FROM (
          SELECT session_id, MAX(timestamp) AS max_timestamp 
          FROM conversations 
          GROUP BY session_id
        ) 
        ORDER BY max_timestamp DESC
      `);
  
      return rows.map(row => row.session_id); // Extract session IDs from the rows
    } catch (error) {
      await this.logger.log('Error fetching all session IDs from the database', error);
      throw new Error(`Failed to fetch all session IDs: ${(error as Error).message}`);
    }
  }
  
  // Function to combine in-memory and database session IDs
  async getAllSessionIds(): Promise<string[]> {
    const dbSessionIds = await this.fetchAllSessionIdsFromDatabase();
    const combinedSessionIds = new Set([...dbSessionIds, ...this.sessionIds]); // Combine and ensure uniqueness
    return Array.from(combinedSessionIds);
  }

  // Save a conversation turn
  async saveConversation(question: string, answer: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      await this.db.run(
        'INSERT INTO conversations (id, session_id, question, answer) VALUES (?, ?, ?, ?)',
        [uuidv4(), this.sessionId, question, answer]
      );
      await this.logger.log('Conversation saved to database');
    } catch (error) {
      await this.logger.log('Error saving conversation to database', error);
      throw new Error(`Failed to save conversation: ${(error as Error).message}`);
    }
  }

  // Save documents along with metadata and content
  async saveDocuments(documents: { file_name: string; file_path: string }[]): Promise<void> {
    const sessionId = this.getSessionId();  // Always use the same session ID
  
    if (!this.db) {
      throw new Error('Database not initialized');
    }
  
    try {
      for (const doc of documents) {
        await this.db.run(
          'INSERT INTO documents (id, session_id, file_name, file_path) VALUES (?, ?, ?, ?)',
          [uuidv4(), sessionId, doc.file_name, doc.file_path]  // Use consistent session ID
        );
      }
      await this.logger.log('Document metadata saved to database under session ' + sessionId);
    } catch (error) {
      await this.logger.log('Error saving document metadata to database', error);
      throw new Error(`Failed to save document metadata: ${(error as Error).message}`);
    }
  }

  // Retrieve the names of documents for a specific session
  async getDocumentNames(sessionId: string): Promise<{
    file_name: string; file_path: string; 
}[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const rows = await this.db.all(
        'SELECT file_name, file_path FROM documents WHERE session_id = ? ORDER BY timestamp ASC',
        [sessionId]
      );
      return rows;
    } catch (error) {
      await this.logger.log('Error retrieving document names', error);
      throw new Error(`Failed to retrieve document names: ${(error as Error).message}`);
    }
  }

  // Retrieve conversation history for the current session
  async getConversationHistory(): Promise<ConversationTurn[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const rows = await this.db.all(
        'SELECT question, answer FROM conversations WHERE session_id = ? ORDER BY timestamp ASC',
        [this.sessionId]
      );
      return rows as ConversationTurn[]; 
    } catch (error) {
      await this.logger.log('Error retrieving conversation history', error);
      throw new Error(`Failed to retrieve conversation history: ${(error as Error).message}`);
    }
  }
}



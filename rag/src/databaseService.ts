import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from './logger';

interface ConversationTurn {
  question: string;
  answer: string;
}

export class DatabaseService {
  private db: Database | null = null;
  private logger: Logger;
  private sessionId: string;

  constructor() {
    this.logger = Logger.getInstance();
    this.sessionId = uuidv4();  // Session ID is generated on initialization
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

      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS conversations (
          id TEXT PRIMARY KEY,
          session_id TEXT,
          question TEXT,
          answer TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.logger.log('Database initialized successfully');
    } catch (error) {
      await this.logger.log('Error initializing database', error);
      throw new Error(`Failed to initialize database: ${(error as Error).message}`);
    }
  }

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

  // Reset session by generating a new session ID
  startNewSession(): void {
    this.sessionId = uuidv4();
  }

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

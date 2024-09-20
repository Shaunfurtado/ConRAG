// rag\src\logger.ts
import fs from 'fs/promises';
import { config } from './config';

export class Logger {
  private static instance: Logger;
  private logFile: string;

  private constructor() {
    this.logFile = config.logPath;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public async log(message: string, data?: any): Promise<void> {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      data: data instanceof Error ? { 
        name: data.name,
        message: data.message,
        stack: data.stack
      } : data,
    };

    await fs.appendFile(this.logFile, JSON.stringify(logEntry) + '\n');
  }
}
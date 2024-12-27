import fs from 'fs/promises';
import path from 'path';

export class Logger {
  private static instance: Logger;
  private logFile: string;

  private constructor() {
    this.logFile = './logs/rag_system.log';
    this.initializeLogFile();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private async initializeLogFile(): Promise<void> {
    const logDir = path.dirname(this.logFile);
    try {
      await fs.mkdir(logDir, { recursive: true });
      await fs.access(this.logFile);
    } catch {
      await fs.writeFile(this.logFile, ''); // Create the file if it does not exist
    }
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
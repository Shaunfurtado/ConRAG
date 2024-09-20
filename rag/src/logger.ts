// src/logger.ts
import fs from 'fs/promises';
import { config } from './config';

export class Logger {
  private logs: any[] = [];

  async log(message: string, data?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      message,
      data,
    };
    this.logs.push(logEntry);
    console.log(message, data ? data : '');
  }

  async saveLogs() {
    try {
      await fs.writeFile(config.logPath, JSON.stringify(this.logs, null, 2));
      console.log('Logs saved successfully.');
    } catch (error) {
      console.error('Error saving logs:', error);
    }
  }
}

export const logger = new Logger();
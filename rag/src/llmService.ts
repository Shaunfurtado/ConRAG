// rag\src\llmService.ts
import { Ollama } from '@langchain/ollama';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { Logger } from './logger';

dotenv.config();

export class LLMService {
  private ollama!: Ollama;
  private gemini!: GoogleGenerativeAI;
  private logger: Logger;
  private currentModel: 'gemini' | 'ollama';

  constructor() {
    this.logger = Logger.getInstance();

    // Initialize with Gemini by default
    this.currentModel = 'gemini'; // Default to Gemini

    this.initializeModels(); // Initialize the models
  }

  private initializeModels(): void {
    // Load API key for Gemini from environment variables
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('Gemini API_KEY is not found');
    }

    // Initialize Ollama and Gemini APIs
    this.ollama = new Ollama({
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: 'llama3.1',
    });

    this.gemini = new GoogleGenerativeAI(geminiApiKey);
  }

  // Switch models dynamically based on user selection
  async switchModel(modelName: 'gemini' | 'ollama'): Promise<void> {
    await this.logger.log(`Switching to model: ${modelName}`);
    this.currentModel = modelName; // Update the current model based on the API request
  }

  // Generate response based on the current model
  async generateResponse(prompt: string): Promise<string> {
    await this.logger.log('Generating LLM response', { prompt });

    let response: string;

    if (this.currentModel === 'gemini') {
      await this.logger.log('Using Gemini API');
      const geminiModel = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await geminiModel.generateContent(prompt);
      response = (await result.response.text()).trim();
    } else {
      await this.logger.log('Using Ollama API');
      response = await this.ollama.call(prompt);
    }

    await this.logger.log('LLM response generated', { response });
    return response;
  }
}

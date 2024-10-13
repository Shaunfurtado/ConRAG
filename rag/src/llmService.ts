import { Ollama } from '@langchain/ollama';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { Logger } from './logger';

dotenv.config();

export class LLMService {
  private ollama: Ollama;
  private gemini: GoogleGenerativeAI;
  private logger: Logger;
  private useGemini: boolean; // Flag to switch between Ollama and Gemini

  constructor() {
    // Load API key for Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API_KEY is not found');
    }

    // Initialize Ollama and Gemini APIs
    this.ollama = new Ollama({
      baseUrl: 'http://localhost:11434',
      model: 'llama3.1',
    });

    this.gemini = new GoogleGenerativeAI(apiKey);

    // Initialize logger
    this.logger = Logger.getInstance();

    // Set whether to use Gemini (manual condition, change this flag as needed)
    this.useGemini = true; // Set to true to use Gemini, false to use Ollama
  }

  // Generate response based on the configured API
  async generateResponse(prompt: string): Promise<string> {
    await this.logger.log('Generating LLM response', { prompt });

    let response: string;

    if (this.useGemini) {
      // Using Gemini
      await this.logger.log('Using Gemini API');
      const geminiModel = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await geminiModel.generateContent(prompt);
      response = (await result.response.text()).trim();
    } else {
      // Using Ollama
      await this.logger.log('Using Ollama API');
      response = await this.ollama.call(prompt);
    }

    await this.logger.log('LLM response generated', { response });
    return response;
  }
}

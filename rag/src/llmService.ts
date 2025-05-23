// rag/src/llmService.ts
import { Ollama } from '@langchain/ollama';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { Logger } from './logger';
import axios from 'axios';  // For making HTTP requests to the Python server

dotenv.config();

export class LLMService {
  private ollama!: Ollama;
  private gemini!: GoogleGenerativeAI;
  private logger: Logger;
  private currentModel: 'gemini' | 'ollama' | 'metaai';  // Added metaai option

  constructor() {
    this.logger = Logger.getInstance();
    this.currentModel = 'gemini'; // Default model. Can be changed dynamically
    this.initializeModels(); // Initialize the models
  }

  private initializeModels(): void {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('Gemini API_KEY is not found');
    }

    this.ollama = new Ollama({
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: 'llama3.2:1b',
    });

    this.gemini = new GoogleGenerativeAI(geminiApiKey);
  }

  // Switch models dynamically based on user selection
  async switchModel(modelName: 'gemini' | 'ollama' | 'metaai'): Promise<void> {  // Added metaai
    await this.logger.log(`Switching to model: ${modelName}`);
    this.currentModel = modelName;
  }

  // Generate response based on the current model
  async generateResponse(prompt: string): Promise<string> {
    await this.logger.log('Generating LLM response', { prompt });
    
    let response: string;

    if (this.currentModel === 'gemini') {
      await this.logger.log('Using Gemini API');
      const geminiModel = this.gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await geminiModel.generateContent(prompt);
      response = (await result.response.text()).trim();
    } else if (this.currentModel === 'ollama') {
      await this.logger.log('Using Ollama API');
      const stream = await this.ollama.stream(prompt);
      response = '';
      for await (const chunk of stream) {
        response += chunk;
      }
    }// ...existing code...
else if(this.currentModel === 'metaai') {
  await this.logger.log('Using Meta AI API');
  const metaAiResponse = await axios.post('http://localhost:5000/metaai', { prompt });
  if (typeof metaAiResponse.data === 'object' && metaAiResponse.data !== null && 'response' in metaAiResponse.data) {
    response = (metaAiResponse.data as { response: string }).response;
  } else {
    throw new Error('Invalid response data from Meta AI API');
  }
}

    else {
      throw new Error('Invalid model name');
    }

    await this.logger.log('LLM response generated', { response });
    return response;
  }
}
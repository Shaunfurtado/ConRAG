// rag\src\llmService.ts
import { Ollama } from 'ollama';
import { config } from './config';

export class LLMService {
  private ollama: Ollama;

  constructor() {
    this.ollama = new Ollama();
  }

  async generateResponse(prompt: string): Promise<string> {
    const response = await this.ollama.generate({
      model: 'phi3.5',
      prompt
    });
    return response.response;
  }
}

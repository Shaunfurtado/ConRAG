// rag\src\llmService.ts
import { Ollama } from '@langchain/ollama';
import { Logger } from './logger';

export class LLMService {
  private ollama: Ollama;
  private logger: Logger;

  constructor() {
    this.ollama = new Ollama({
      baseUrl: 'http://localhost:11434',
      model: 'llama3.1',
    });
    this.logger = Logger.getInstance();
  }

  async generateResponse(prompt: string): Promise<string> {
    await this.logger.log('Generating LLM response', { prompt });
    const response = await this.ollama.call(prompt);
    await this.logger.log('LLM response generated', { response });
    return response;
  }
}
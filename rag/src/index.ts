// rag\src\index.ts
import { RAGSystem } from './ragSystem';
import { loadDocument } from './documentLoader';
import readline from 'readline';

async function main() {
  console.log('Initializing RAG system...');
  const ragSystem = new RAGSystem();
  
  console.log('Loading documents...');
  const documents = await loadDocument();
  
  console.log('Initializing vector store and adding documents...');
  await ragSystem.initialize(documents);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('RAG system initialized. Type your questions or "exit" to quit.');

  rl.on('line', async (input) => {
    if (input.toLowerCase() === 'exit') {
      console.log('Exiting RAG system. Goodbye!');
      rl.close();
      return;
    }

    console.log('\nProcessing your question...');

    try {
      console.log('Searching for relevant documents...');
      const result = await ragSystem.query(input);
      
      console.log('Generating answer...');
      console.log('\nAnswer:', result.answer);
      
      console.log('\nSources used:');
      result.sources.forEach((source, index) => {
        console.log(`  ${index + 1}. ${source}`);
      });
    } catch (error) {
      console.error('Error occurred while processing the question:', error);
    }

    console.log('\nAsk another question or type "exit" to quit:');
  });
}

main().catch((error) => {
  console.error('An error occurred during RAG system initialization:', error);
});

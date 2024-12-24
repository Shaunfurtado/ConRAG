import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-5xl font-bold mb-10 text-center">AI Assistant Prototypes</h1>
      <div className="space-y-8">
        <Link href="/rag-ai-assistant">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded w-72 shadow-lg transition-transform transform hover:scale-105 hover:shadow-blue-500/50">
            RAG AI Assistant
          </button>
        </Link>
        <Link href="/ai-chat-app">
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-8 rounded w-72 shadow-lg transition-transform transform hover:scale-105 hover:shadow-green-500/50">
            AI Chat App
          </button>
        </Link>
        <Link href="/advanced-rag-assistant">
          <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded w-72 shadow-lg transition-transform transform hover:scale-105 hover:shadow-purple-500/50">
            Advanced RAG Assistant
          </button>
        </Link>
      </div>
    </div>
  );
}
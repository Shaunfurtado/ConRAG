import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">AI Assistant Prototypes. Needs to be Mixed.</h1>
      <div className="space-y-4">
        <Link href="/rag-ai-assistant">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-64">
            RAG AI Assistant
          </button>
        </Link>
        <Link href="/ai-chat-app">
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-64">
            AI Chat App
          </button>
        </Link>
        <Link href="/advanced-rag-assistant">
          <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded w-64">
            Advanced RAG Assistant
          </button>
        </Link>
      </div>
    </div>
  );
}
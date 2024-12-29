"use client";
import Link from "next/link";
import {
  Zap,
  ChevronDown,
  ChevronUp,
  FileSearch2,
  Lightbulb,
} from "lucide-react";
import { useState, useRef } from "react";

const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-semibold">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && <p className="mt-2 text-gray-600">{answer}</p>}
    </div>
  );
};

export default function Home() {
  const whatIsConRAGRef = useRef<HTMLElement>(null);

  const scrollToNextSection = () => {
    whatIsConRAGRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      {/* Hero Section */}
      <section className="flex min-h-screen flex-col items-center justify-center text-center p-4">
        <h1 className="mb-8 text-8xl font-bold text-gray-800">ConRAG</h1>
        <p className="mb-10 text-3xl text-gray-600 max-w-2xl">
          A RAG-based conversational AI with natural speech synthesis
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-20">
          <Link
            href="/advanced-rag-assistant"
            className="px-6 py-3 bg-black text-white rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Try Now
          </Link>
          <Link
            href="https://shaunfurtado.is-a.dev/ConRAG-docs/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-white text-blue-600 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
          >
            Documentation
          </Link>
        </div>

        <button
          onClick={scrollToNextSection}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white text-black-600 rounded-full p-4 shadow-lg hover:bg-black-50 transition-colors focus:outline-none focus:ring-2 focus:ring-black-500"
          aria-label="Scroll to next section"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </section>

      {/* What is ConRAG Section */}
      <section ref={whatIsConRAGRef} className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-8">
            What is ConRAG?
          </h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
            ConRAG (Conversational Retrieval-Augmented Generation) combines
            advanced retrieval and generation techniques to deliver accurate,
            context-aware, and human-like responses. It streamlines workflows,
            enhances productivity, and provides seamless access to information
            through natural conversations and voice interactions. Perfect for
            customer support, research, and education.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-16">
          <h2 className="text-4xl font-bold text-center mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <FileSearch2 className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-2">
                Smart Information Retrieval
              </h3>
              <p className="text-gray-600">
                Locate and process relevant data from vast document libraries
                with unparalleled speed and precision.
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-md">
              <Zap className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-2">RAG Technology</h3>
              <p className="text-gray-600">
                Leverage the power of Retrieval-Augmented Generation for more
                accurate and informed responses.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Lightbulb className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-2">
                AI-Powered Insights
              </h3>
              <p className="text-gray-600">
                Extract actionable insights from your documents with
                cutting-edge AI-driven retrieval and generation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto">
            <FAQItem
              question="What is Retrieval-Augmented Generation (RAG), and how does it work in ConRAG?"
              answer="Retrieval-Augmented Generation combines the power of document retrieval and language generation. In ConRAG, documents are retrieved from a vector database (Pinecone) using semantic search, and responses are generated using LLaMA v3.1, providing accurate and context-aware answers."
            />
            <FAQItem
              question="What types of documents can ConRAG process for retrieval and generation?"
              answer="ConRAG supports a wide range of documents, including PDFs, text files, and structured databases. It uses Pinecone and LangChain to index and retrieve relevant information from these sources for real-time query processing."
            />
            <FAQItem
              question="Is ConRAG suitable for enterprise use?"
              answer="Yes, ConRAG is designed with enterprise needs in mind. It offers robust security features, scalability to handle large volumes of conversations, and can be customized to integrate with existing enterprise systems and knowledge bases."
            />
            <FAQItem
              question="What are the primary applications of ConRAG?"
              answer="ConRAG is designed for customer service, knowledge management, research, and education. It excels in scenarios requiring accurate, context-aware responses, such as technical support, academic research, or document-intensive workflows."
            />
          </div>
        </div>
      </section>
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 ConRAG. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

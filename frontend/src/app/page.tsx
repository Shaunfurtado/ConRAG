'use client'
import Link from 'next/link'
import { MessageSquare, Zap, Shield, ChevronDown, ChevronUp } from 'lucide-react'
import { useState,useRef } from 'react'

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false)

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
  )
}

export default function Home() {
  const whatIsConRAGRef = useRef<HTMLElement>(null)

  const scrollToNextSection = () => {
    whatIsConRAGRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      {/* Hero Section */}
      <section className="flex min-h-screen flex-col items-center justify-center text-center p-4">
        <h1 className="mb-4 text-6xl font-bold text-gray-800">ConRAG</h1>
        <p className="mb-8 text-xl text-gray-600 max-w-2xl">
          A RAG-based conversational AI with natural speech synthesis
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/advanced-rag-assistant" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Try Now
          </Link>
          <Link 
            href="https://shaunfurtado.is-a.dev/ConRAG-docs/" target='_blank' rel='noopener noreferrer' 
            className="px-6 py-3 bg-white text-blue-600 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
          >
            Documentation
          </Link>
        </div>
        <button
          onClick={scrollToNextSection}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white text-blue-600 rounded-full p-4 shadow-lg hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Scroll to next section"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </section>

      {/* What is ConRAG Section */}
      <section ref={whatIsConRAGRef} className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-8">What is ConRAG?</h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
            ConRAG is a cutting-edge conversational AI platform that utilizes Retrieval-Augmented Generation (RAG) 
            to provide more accurate, context-aware responses. Combined with natural speech synthesis, 
            ConRAG offers an unparalleled, human-like conversation experience.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <MessageSquare className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Natural Conversations</h3>
              <p className="text-gray-600">Engage in fluid, context-aware dialogues that feel remarkably human-like.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Zap className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-2">RAG Technology</h3>
              <p className="text-gray-600">Leverage the power of Retrieval-Augmented Generation for more accurate and informed responses.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Shield className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Secure & Scalable</h3>
              <p className="text-gray-600">Built with enterprise-grade security and designed to scale with your needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto">
            <FAQItem 
              question="What is RAG in ConRAG?" 
              answer="RAG stands for Retrieval-Augmented Generation. It's a technique that enhances the AI's responses by retrieving relevant information from a knowledge base before generating an answer. This results in more accurate and contextually appropriate responses."
            />
            <FAQItem 
              question="How does ConRAG's speech synthesis work?" 
              answer="ConRAG uses advanced natural language processing and text-to-speech technologies to convert the AI-generated text responses into natural-sounding speech. This creates a more immersive and human-like interaction experience."
            />
            <FAQItem 
              question="Is ConRAG suitable for enterprise use?" 
              answer="Yes, ConRAG is designed with enterprise needs in mind. It offers robust security features, scalability to handle large volumes of conversations, and can be customized to integrate with existing enterprise systems and knowledge bases."
            />
            <FAQItem 
              question="Can ConRAG be integrated into my existing applications?" 
              answer="ConRAG provides APIs that allow for seamless integration into various applications, whether they're web-based, mobile, or desktop applications. Our documentation provides detailed guides on how to integrate ConRAG into your existing tech stack."
            />
          </div>
        </div>
      </section>
    </div>
  )
}


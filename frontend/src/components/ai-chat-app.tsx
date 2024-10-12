"use client"

import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mic, Paperclip, Send } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'

type Message = {
  id: string
  content: string
  sender: 'user' | 'ai'
}

export function AiChatApp() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', content: "Hello! How can I assist you today?", sender: 'ai' },
  ])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const userMessage: Message = { id: Date.now().toString(), content: newMessage, sender: 'user' }
      setMessages((prevMessages) => [...prevMessages, userMessage])
      setNewMessage('')
      setLoading(true)
  
      try {
        // Send the user message to the backend via POST request to the RAG system server running at http://localhost:3001/query
        const response = await fetch('http://localhost:3001/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question: userMessage.content }),
        })
  
        const data = await response.json()
        const aiMessage: Message = {
          id: Date.now().toString(),
          content: data.answer || 'Sorry, something went wrong.',
          sender: 'ai',
        }
  
        setMessages((prevMessages) => [...prevMessages, aiMessage])
      } catch (error) {
        console.error('Error fetching AI response:', error)
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: Date.now().toString(), content: 'Error fetching response from server.', sender: 'ai' },
        ])
      } finally {
        setLoading(false)
      }
    }
  }
  

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow py-4 px-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">AI Chat Assistant</h1>
      </header>

      <ScrollArea className="flex-1 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div className={`flex ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start`}>
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={message.sender === 'user' ? "/placeholder.svg?height=32&width=32" : "/placeholder.svg?height=32&width=32&text=AI"}
                />
                <AvatarFallback>{message.sender === 'user' ? 'U' : 'AI'}</AvatarFallback>
              </Avatar>
              <div
                className={`mx-2 p-3 rounded-lg ${
                  message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white'
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({node, inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          {...props}
                          children={String(children).replace(/\n$/, '')}
                          style={atomDark}
                          language={match[1]}
                          PreTag="div"
                        />
                      ) : (
                        <code {...props} className={className}>
                          {children}
                        </code>
                      )
                    }
                  }}
                  className="prose dark:prose-invert max-w-none"
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>

      <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button size="icon" variant="ghost" disabled={loading}>
            <Mic className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost" disabled={loading}>
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button size="icon" onClick={handleSendMessage} disabled={loading}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

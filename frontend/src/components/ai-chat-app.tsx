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

type Message = {
  id: string
  content: string
  sender: 'user' | 'ai'
}

export function AiChatApp() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', content: "Hello! How can I assist you today?", sender: 'ai' },
    { id: '2', content: "Can you explain what markdown is?", sender: 'user' },
    { id: '3', content: `Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents. It was created by John Gruber in 2004 and has become one of the world's most popular markup languages.

Here are some examples of Markdown syntax:

# Heading 1
## Heading 2
### Heading 3

- Bullet point 1
- Bullet point 2
- Bullet point 3

1. Numbered list item 1
2. Numbered list item 2
3. Numbered list item 3

**Bold text**
*Italic text*
~~Strikethrough text~~

[Link to OpenAI](https://www.openai.com)

\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`

Markdown is widely used for:
- README files
- Forum & blog posts
- Documentation
- Note-taking

It's designed to be easy to read and write, and can be converted to HTML and many other formats.`, sender: 'ai' },
  ])
  const [newMessage, setNewMessage] = useState('')

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { id: Date.now().toString(), content: newMessage, sender: 'user' }])
      setNewMessage('')
      // Here you would typically call an API to get the AI's response
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
                <AvatarImage src={message.sender === 'user' ? "/placeholder.svg?height=32&width=32" : "/placeholder.svg?height=32&width=32&text=AI"} />
                <AvatarFallback>{message.sender === 'user' ? 'U' : 'AI'}</AvatarFallback>
              </Avatar>
              <div
                className={`mx-2 p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white'
                }`}
              >
                <ReactMarkdown
                  components={{
                    code({node, inline, className, children, ...props}: {node: any, inline: boolean, className: string, children: React.ReactNode}) {
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
          <Button size="icon" variant="ghost">
            <Mic className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button size="icon" onClick={handleSendMessage}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
"use client"

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Mic, Paperclip, Send, ChevronRight, ChevronDown, Plus, Settings, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export function RagAiAssistant() {
  const [activeTab, setActiveTab] = useState('chat')
  const [activeChat, setActiveChat] = useState('chat1')
  const [activeProfile, setActiveProfile] = useState('General')
  const [message, setMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const chats = [
    { id: 'chat1', name: 'Project Brainstorming' },
    { id: 'chat2', name: 'Code Review' },
    { id: 'chat3', name: 'Data Analysis' },
    { id: 'chat4', name: 'Writing Assistant' },
  ]

  const profiles = ['General', 'Tutor', 'NotesPrep', 'Research Ast']

  const sources = [
    { id: 'doc1', name: 'Project Proposal.pdf' },
    { id: 'doc2', name: 'Meeting Notes.docx' },
    { id: 'doc3', name: 'Data Analysis Report.xlsx' },
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsUploading(true)
      const interval = setInterval(() => {
        setUploadProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval)
            setIsUploading(false)
            return 100
          }
          return prevProgress + 10
        })
      }, 500)
    }
  }

  const markdownExample = `
# Markdown Example

This is a paragraph with **bold** and *italic* text.

## Code Block

\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`

## Table

| Column 1 | Column 2 |
|----------|----------|
| Row 1    | Data 1   |
| Row 2    | Data 2   |

## List

- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2
- Item 3
  `

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-800 p-4 flex flex-col">
        <div className="mb-8">
          <img src="/placeholder.svg?height=40&width=120" alt="Logo" className="h-10" />
        </div>
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full mb-2 text-lg font-semibold">
            Chats
            <ChevronRight className="h-5 w-5" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="space-y-2">
              {chats.map((chat) => (
                <li key={chat.id}>
                  <Button
                    variant={activeChat === chat.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveChat(chat.id)}
                  >
                    {chat.name}
                  </Button>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
        <Collapsible className="mt-4">
          <CollapsibleTrigger className="flex items-center justify-between w-full mb-2 text-lg font-semibold">
            Profiles
            <ChevronRight className="h-5 w-5" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="space-y-2">
              {profiles.map((profile) => (
                <li key={profile}>
                  <Button
                    variant={activeProfile === profile ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveProfile(profile)}
                  >
                    {profile}
                  </Button>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 p-4 flex items-center justify-between">
          <div className="flex-1" />
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-64">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="avatar">Avatar</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex-1 flex justify-end">
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 text-white">
                <h2 className="text-2xl font-bold mb-4">Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Dark Mode</span>
                    <Switch checked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Language</span>
                    <Select defaultValue="en">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Model</span>
                    <Select defaultValue="gpt-4">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input placeholder="API Key" type="password" />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Chat/Avatar Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'chat' ? (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col"
              >
                <ScrollArea className="flex-1 p-4">
                  <ReactMarkdown
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
                  >
                    {markdownExample}
                  </ReactMarkdown>
                </ScrollArea>
                <div className="p-4 bg-gray-800">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="icon" variant="ghost">
                      <Mic className="h-5 w-5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <Paperclip className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <label className="cursor-pointer w-full">
                            Upload File
                            <input type="file" className="hidden" onChange={handleFileUpload} />
                          </label>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Google Drive</DropdownMenuItem>
                        <DropdownMenuItem>Direct Link</DropdownMenuItem>
                        <DropdownMenuItem>Text Input</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size="icon">
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                  {isUploading && (
                    <div className="mt-2">
                      <div className="h-2 bg-gray-700 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">Uploading... {uploadProgress}%</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="avatar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full flex items-center justify-center"
              >
                <div className="text-center">
                  <Avatar className="h-48 w-48 mx-auto mb-4">
                    <AvatarImage src="/placeholder.svg?height=192&width=192" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold mb-2">AI Assistant</h2>
                  <p className="text-gray-400">How can I help you today?</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Context Window */}
        <Collapsible className="bg-gray-800 p-4">
          <CollapsibleTrigger className="flex items-center justify-between w-full mb-2 text-lg font-semibold">
            Context
            <ChevronDown className="h-5 w-5" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p className="text-sm text-gray-400">
              Summarized view of relevant conversation parts...
            </p>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Right Sidebar */}
      <div className="w-64 bg-gray-800 p-4 flex flex-col">
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full mb-2 text-lg font-semibold">
            Sources
            <ChevronRight className="h-5 w-5" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="space-y-2">
              {sources.map((source) => (
                <li key={source.id}>
                  <Button variant="ghost" className="w-full justify-start">
                    {source.name}
                  </Button>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
        <Collapsible className="mt-4">
          <CollapsibleTrigger className="flex items-center justify-between w-full mb-2 text-lg font-semibold">
            Knowledge Base
            <ChevronRight className="h-5 w-5" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p className="text-sm text-gray-400">Expandable knowledge base content...</p>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" className="rounded-full h-14 w-14 shadow-lg">
              <Plus className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Mic className="mr-2 h-4 w-4" />
              <span>Voice Command</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Plus className="mr-2 h-4 w-4" />
              <span>New Chat</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
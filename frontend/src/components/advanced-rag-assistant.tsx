'use client'

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Mic, PaperclipIcon, Send, Settings, Plus, Volume2 } from 'lucide-react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export function AdvancedRagAssistant() {
  const [activeTab, setActiveTab] = useState('chat');
  const [activeProfile, setActiveProfile] = useState('General');
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [chats, setChats] = useState(['Chat 1', 'Chat 2']);
  const [selectedChat, setSelectedChat] = useState('Chat 1');
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({
    'Chat 1': [],
    'Chat 2': []
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addNewChat = () => {
    const newChatName = `Chat ${chats.length + 1}`;
    setChats((prevChats) => [...prevChats, newChatName]);
    setMessages((prevMessages) => ({ ...prevMessages, [newChatName]: [] }));
  };

  const sendMessage = async (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setMessages((prevMessages) => ({
      ...prevMessages,
      [selectedChat]: [...prevMessages[selectedChat], { sender: 'user', text: message, timestamp }]
    }));
    try {
      const response = await fetch('/api/processMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      setMessages((prevMessages) => ({
        ...prevMessages,
        [selectedChat]: [...prevMessages[selectedChat], { sender: 'ai', text: data.response, timestamp: new Date().toLocaleTimeString() }]
      }));
    } catch (error) {
      console.error('Error occurred while processing the message:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-800 p-4 flex flex-col">
        <div className="mb-8">
          <img src="/placeholder.svg?height=40&width=40" alt="Logo" className="h-10 w-10" />
        </div>
        <div className="mb-8">
          <h3 className="mb-2 text-sm font-semibold text-gray-400">Chat History</h3>
          <List>
            {chats.map((chat) => (
              <ListItem key={chat} disablePadding>
                <ListItemButton
                  selected={selectedChat === chat}
                  onClick={() => setSelectedChat(chat)}
                >
                  <ListItemText primary={chat} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Button onClick={addNewChat} className="mt-4 bg-blue-500 text-white py-1 px-2 rounded">Add New Chat</Button>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-400">Profiles</h3>
          <List>
            {['General', 'Tutor', 'NotesPrep', 'Research Ast'].map((profile) => (
              <ListItem key={profile} disablePadding>
                <ListItemButton
                  selected={activeProfile === profile}
                  onClick={() => setActiveProfile(profile)}
                >
                  <ListItemText primary={profile} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">AI Assistant</h1>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-64">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="avatar">Avatar</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </header>

        {/* Chat/Avatar Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' ? (
            <ScrollArea className="h-full p-4">
              {/* Chat messages would go here */}
              <div className="space-y-4">
                {messages[selectedChat]?.map((msg, index) => (
                  <div key={index} className={`flex items-start ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                    {msg.sender === 'ai' && (
                      <Avatar className="mr-2">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="AI" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`bg-${msg.sender === 'user' ? 'blue-600' : 'gray-700'} rounded-lg p-3 max-w-[80%]`}>
                      <p className="text-sm">{msg.text}</p>
                      <span className="text-xs text-gray-400 mt-1">{msg.timestamp}</span>
                    </div>
                    {msg.sender === 'user' && (
                      <Avatar className="ml-2">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <Avatar className="h-48 w-48 mb-4">
                <AvatarImage src="/placeholder.svg?height=192&width=192" alt="AI Avatar" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="text-lg font-semibold mb-2">AI Assistant</p>
                <p className="text-sm text-gray-400">Thinking...</p>
              </div>
              <Button className="mt-4" onClick={() => setActiveTab('chat')}>
                <Volume2 className="mr-2 h-4 w-4" /> Speak to Avatar
              </Button>
            </div>
          )}
        </div>

        {/* Context Window */}
        <div className="bg-gray-800 p-4 h-24 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Context</h3>
          <p className="text-sm">Relevant parts of the conversation history would be displayed here...</p>
        </div>

        {/* Message Input */}
        <div className="bg-gray-800 p-4 flex items-center">
          <Button variant="outline" size="icon" className="mr-2">
            <Mic className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="mr-2" onClick={() => setIsFileUploadOpen(true)}>
            <PaperclipIcon className="h-4 w-4" />
          </Button>
          <Input
            className="flex-1 bg-gray-700"
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendMessage(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <Button className="ml-2" onClick={() => {
            const inputElement = document.querySelector('input') as HTMLInputElement;
            if (inputElement) {
              sendMessage(inputElement.value);
              inputElement.value = '';
            }
          }}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-64 bg-gray-800 p-4 flex flex-col">
        <div className="mb-8">
          <h3 className="mb-2 text-sm font-semibold text-gray-400">Sources</h3>
          <ul className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <li key={index} className="px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">
                {file.name}
              </li>
            ))}
          </ul>
        </div>
        <Button variant="outline" className="mb-8" onClick={() => setIsSettingsOpen(true)}>
          <Settings className="mr-2 h-4 w-4" /> Settings
        </Button>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-400">Knowledge Base</h3>
          <div className="bg-gray-700 rounded p-2 text-sm">
            Relevant information retrieved during chat would be displayed here...
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <Button className="fixed bottom-4 right-4 rounded-full" size="icon" onClick={addNewChat}>
        <Plus className="h-4 w-4" />
      </Button>

      {/* File Upload Modal */}
      <Dialog open={isFileUploadOpen} onOpenChange={setIsFileUploadOpen}>
        <DialogContent className="sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
          </DialogHeader>
          <div className="p-4 border-2 border-dashed border-gray-400 rounded-lg text-center">
            <p>Drag & drop files here, or click to select files</p>
            <p className="text-sm text-gray-400 mt-2">Supported formats: PDF, TXT, Markdown, Audio</p>
            <input
              type="file"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <Button onClick={() => fileInputRef.current?.click()} className="mt-4">
              Select Files
            </Button>
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="outline">Google Drive</Button>
            <Button variant="outline">Paste Link</Button>
            <Button variant="outline">Direct Input</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">STT Language</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">TTS Language</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">LLM Model</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt3.5">GPT-3.5</SelectItem>
                  <SelectItem value="gpt4">GPT-4</SelectItem>
                  <SelectItem value="custom">Custom Model</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Enable Voice Commands</span>
              <Switch />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
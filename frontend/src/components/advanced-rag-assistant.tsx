"use client";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaPlus } from "react-icons/fa6";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Mic,
  PaperclipIcon,
  Send,
  Settings,
  Plus,
  Volume2,
  CircleStop,
} from "lucide-react";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

type Message = {
  id: string;
  content: string;
  sender: "user" | "ai";
};

export function AdvancedRagAssistant() {
  const [activeTab, setActiveTab] = useState("chat");
  const [activeProfile, setActiveProfile] = useState("General");
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const [inputText, setInputText] = useState(""); // Now using this as main input state
  const [inputPlaceholder, setInputPlaceholder] = useState(
    "Type your message..."
  );

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", content: "Hello! How can I assist you today?", sender: "ai" },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (inputText.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: inputText,
        sender: "user",
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInputText("");
      setLoading(true);

      try {
        const response = await fetch("http://localhost:3001/query", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: userMessage.content }),
        });

        const data = await response.json();
        const aiMessage: Message = {
          id: Date.now().toString(),
          content: data.answer || "Sorry, something went wrong.",
          sender: "ai",
        };

        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error("Error fetching AI response:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now().toString(),
            content: "Error fetching response from server.",
            sender: "ai",
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setInputPlaceholder("Started listening...");
    setTranscript("");
    setInputText("");
    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.onresult = (event: any) => {
      const finalTranscript = event.results[0][0].transcript;
      setTranscript(finalTranscript);
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setInputPlaceholder("Type your message...");
    }
  };

  const handleToggleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  useEffect(() => {
    if (!isRecording && transcript) {
      setInputText(transcript);
    }
  }, [isRecording, transcript]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-800 p-4 flex flex-col">
        <div className="mb-8">
          <img
            src="/placeholder.svg?height=40&width=40"
            alt="Logo"
            className="h-10 w-10"
          />
        </div>
        <div className="mb-8">
          <h3 className="mb-2 text-sm font-semibold text-gray-400">
            Chat History
          </h3>
          <button className="p-1 hover:bg-gray-700 rounded flex flex-row space-x-2 border border-b-2">
            <h3>New Chat</h3>
            <FaPlus size={18} className="text-gray-400 mt-1" />{" "}
          </button>
          <ul className="space-y-2">
            {["Chat 1", "Chat 2", "Chat 3", "Chat 4"].map((chat) => (
              <li
                key={chat}
                className="px-2 py-1 rounded hover:bg-gray-700 cursor-pointer"
              >
                {chat}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-400">Profiles</h3>
          <ul className="space-y-2">
            {["General", "Tutor", "NotesPrep", "Research Ast"].map(
              (profile) => (
                <li
                  key={profile}
                  className={`px-2 py-1 rounded cursor-pointer ${
                    activeProfile === profile
                      ? "bg-blue-600"
                      : "hover:bg-gray-700"
                  }`}
                  onClick={() => setActiveProfile(profile)}
                >
                  {profile}
                </li>
              )
            )}
          </ul>
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
          {activeTab === "chat" ? (
            <ScrollArea className="flex-1 p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  } mb-4`}
                >
                  <div
                    className={`flex ${
                      message.sender === "user"
                        ? "flex-row-reverse"
                        : "flex-row"
                    } items-start`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={
                          message.sender === "user"
                            ? "/placeholder.svg?height=32&width=32"
                            : "/placeholder.svg?height=32&width=32&text=AI"
                        }
                      />
                      <AvatarFallback>
                        {message.sender === "user" ? "U" : "AI"}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`mx-2 p-3 rounded-lg ${
                        message.sender === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                      }`}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({
                            node,
                            inline,
                            className,
                            children,
                            ...props
                          }) {
                            const match = /language-(\w+)/.exec(
                              className || ""
                            );
                            return !inline && match ? (
                              <SyntaxHighlighter
                                {...props}
                                children={String(children).replace(/\n$/, "")}
                                style={atomDark}
                                language={match[1]}
                                PreTag="div"
                              />
                            ) : (
                              <code {...props} className={className}>
                                {children}
                              </code>
                            );
                          },
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
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <Avatar className="h-48 w-48 mb-4">
                <AvatarImage
                  src="/placeholder.svg?height=192&width=192"
                  alt="AI Avatar"
                />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="text-lg font-semibold mb-2">AI Assistant</p>
                <p className="text-sm text-gray-400">Thinking...</p>
              </div>
              <Button className="mt-4" onClick={() => setActiveTab("chat")}>
                <Volume2 className="mr-2 h-4 w-4" /> Speak to Avatar
              </Button>
            </div>
          )}
        </div>

        {/* Context Window */}
        <div className="bg-gray-800 p-4 h-24 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Context</h3>
          <p className="text-sm">
            Relevant parts of the conversation history would be displayed
            here...
          </p>
        </div>

        {/* Message Input */}
        <div className="bg-gray-800 p-4 flex items-center">
          <Button
            variant="outline"
            size="icon"
            className={`mr-2`}
            onClick={handleToggleRecording}
          >
            {isRecording ? (
              <CircleStop className={`h-4 w-4`} color="#ff0000" />
            ) : (
              <Mic className={`h-4 w-4 `} />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="mr-2"
            onClick={() => setIsFileUploadOpen(true)}
          >
            <PaperclipIcon className="h-4 w-4" />
          </Button>
          <Input
            className="flex-1 bg-gray-700"
            placeholder={inputPlaceholder}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button className="ml-2" onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-64 bg-gray-800 p-4 flex flex-col">
        <div className="mb-8">
          <h3 className="mb-2 text-sm font-semibold text-gray-400">Sources</h3>
          <ul className="space-y-2">
            {["Doc1", "Doc2", "Doc3"].map((doc) => (
              <li
                key={doc}
                className="px-2 py-1 rounded hover:bg-gray-700 cursor-pointer"
              >
                {doc}
              </li>
            ))}
          </ul>
        </div>
        <Button
          variant="outline"
          className="mb-8"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className="mr-2 h-4 w-4" /> Settings
        </Button>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-400">
            Knowledge Base
          </h3>
          <div className="bg-gray-700 rounded p-2 text-sm">
            Relevant information retrieved during chat would be displayed
            here...
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <Button className="fixed bottom-4 right-4 rounded-full" size="icon">
        <Plus className="h-4 w-4" />
      </Button>

      {/* File Upload Modal */}
      <Dialog open={isFileUploadOpen} onOpenChange={setIsFileUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
          </DialogHeader>
          <div className="p-4 border-2 border-dashed border-gray-400 rounded-lg text-center">
            <p>Drag & drop files here, or click to select files</p>
            <p className="text-sm text-gray-400 mt-2">
              Supported formats: PDF, TXT, Markdown, Audio
            </p>
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
              <label className="block text-sm font-medium mb-1">
                STT Language
              </label>
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
              <label className="block text-sm font-medium mb-1">
                TTS Language
              </label>
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
              <label className="block text-sm font-medium mb-1">
                LLM Model
              </label>
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

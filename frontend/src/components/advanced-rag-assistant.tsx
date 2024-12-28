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
import {
  ClipboardCopyIcon,
  Check,
  Volume2Icon,
  AudioLines,
  ClipboardCopy,
} from "lucide-react";
import { FaPlus } from "react-icons/fa6";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

type ChatHistory = {
  id: string;
  title: string;
};

export function AdvancedRagAssistant() {
  const [activeTab, setActiveTab] = useState("chat");
  const [activeProfile, setActiveProfile] = useState("General");
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const [inputText, setInputText] = useState(""); // Main input state
  const [inputPlaceholder, setInputPlaceholder] = useState(
    "Type your message..."
  );
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null
  );

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", content: "Hello! How can I assist you today?", sender: "ai" },
  ]);
  const [loading, setLoading] = useState(false);
  type Document = { file_name: string };

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => {
    const fetchChatHistories = async () => {
      try {
        const response = await fetch("http://localhost:3001/conversations");
        const data = await response.json();
        setChatHistories(data.conversations);
      } catch (error) {
        console.error("Error fetching chat histories:", error);
      }
    };

    fetchChatHistories();
  }, []);

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
          headers: { "Content-Type": "application/json" },
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

  // Function to handle creating a new chat
  const handleNewChat = async () => {
    setLoading(true); // Start loading state while fetching new chat
    try {
      const response = await fetch("http://localhost:3001/new-conversation", {
        method: "POST",
      });
      const data = await response.json();
      // Add new chat to the chat histories and select the new chat
      setChatHistories((prevHistories) => [
        ...prevHistories,
        { id: data.id, title: `Chat ${data.id}` },
      ]);
      setSelectedChat(data.id); // Set the new chat as selected
      setMessages([]); // Clear any previous messages
    } catch (error) {
      console.error("Error creating new chat:", error);
    } finally {
      setLoading(false); // Stop loading once the request is complete
    }
  };

  // Function to handle selecting an existing chat
  const handleSelectChat = async (chatId: string) => {
    setSelectedChat(chatId);
    try {
      // Fetch messages for the selected chat from the backend
      const response = await fetch(`http://localhost:3001/chat/${chatId}`);
      const data = await response.json();
      setMessages(data.messages); // Set messages of the selected chat
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    }
  };

  // Allowed file types: Images, PDFs, Text files
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "application/pdf",
    "text/plain", // .txt files
    "text/markdown", // .md files
  ];

  // Handle file selection with validation
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      // Validate that all selected files are of an allowed type
      const isValidFile = Array.from(selectedFiles).every((file) =>
        allowedTypes.includes(file.type)
      );

      if (isValidFile) {
        setFiles(selectedFiles);
      } else {
        alert(
          "One or more selected files are not supported. Please choose valid files."
        );
      }
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!files) {
      console.error("No files selected");
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    setLoading(true); // Show loading state

    try {
      const response = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload files");
      }

      const data = await response.json();

      if (data) {
        setSelectedSessionId(data.sessionId);
        alert("Files uploaded successfully!");
      } else {
        alert("Error during upload. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Error uploading files. Please try again later.");
    } finally {
      setLoading(false); // Hide loading state
      setIsFileUploadOpen(false); // Close the modal or file upload dialog
    }
  };

  const splitText = (text: string): string[] => {
    // Splits text into sentences or smaller chunks
    return text.match(/[^.!?]+[.!?]+|[^.!?]+/g) || [];
  };

  const speakMessage = (text: string, messageId: string) => {
    const synth = window.speechSynthesis;
    const utterances = splitText(text); // Split text into chunks
    let currentUtteranceIndex = 0;

    const speakNext = () => {
      if (currentUtteranceIndex < utterances.length) {
        const utterance = new SpeechSynthesisUtterance(
          utterances[currentUtteranceIndex].trim()
        );
        utterance.lang = "en-GB"; // Set language

        // Move to the next chunk when speaking finishes
        utterance.onend = () => {
          currentUtteranceIndex++;
          speakNext();
        };

        // Handle any speech synthesis error
        utterance.onerror = (e) => {
          console.error("Speech synthesis error:", e);
          setSpeakingMessageId(null);
        };

        synth.speak(utterance); // Speak the current chunk
      } else {
        setSpeakingMessageId(null); // Speech finished
      }
    };

    // Stop any currently speaking utterances before starting a new one
    synth.cancel();
    setSpeakingMessageId(messageId);
    speakNext(); // Start speaking
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Stops any ongoing speech
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-800 p-4 flex flex-col shadow-lg">
        <div className="mb-8">
          <img
            src="/placeholder.svg?height=40&width=40"
            alt="Logo"
            className="h-10 w-10"
          />
        </div>
        <div className="mb-8">
          {/* Chat History Section */}
          <h3 className="mb-2 text-sm font-semibold text-gray-400">
            Chat History
          </h3>
          <button
            className="p-1 hover:bg-gray-700 rounded flex items-center space-x-2 border border-b-2"
            onClick={handleNewChat}
            aria-label="Create new chat"
          >
            <h3>New Chat</h3>
            <FaPlus size={18} className="text-gray-400 mt-1" />
          </button>

          <ul className="space-y-2 mt-2">
            {chatHistories.map((chat) => (
              <li
                key={chat.id}
                className={`px-2 py-1 rounded cursor-pointer ${
                  selectedChat === chat.id ? "bg-blue-600" : "hover:bg-gray-700"
                }`}
                onClick={() => handleSelectChat(chat.id)}
                role="button"
                aria-pressed={selectedChat === chat.id}
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSelectChat(chat.id);
                  }
                }}
              >
                {chat.title}
              </li>
            ))}
          </ul>

          {/* Chat Window */}
          {selectedChat && (
            <div className="mt-6">
              <div className="flex items-center space-x-2 border-b pb-4">
                <Avatar>
                  <AvatarImage src="https://via.placeholder.com/150" alt="AI" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <h4 className="text-lg font-semibold">Chat with AI</h4>
              </div>

              {/* Message Display */}
              <ScrollArea className="mt-4 h-96 space-y-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          message.sender === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-300 text-black"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="flex items-center mt-4 space-x-3">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={inputPlaceholder}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleSendMessage}
                  disabled={loading}
                  className="p-2"
                  aria-label="Send Message"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
                  ) : (
                    <Send size={20} />
                  )}
                </Button>
              </div>
            </div>
          )}
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
      <div className="flex-1 flex flex-col overflow-y-auto h-full">
        {/* Header */}
        <header className="bg-gray-800 p-4 flex items-center justify-between header shadow-lg">
          <h2 className="text-xl font-bold text-white">AI Assistant</h2>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-64">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="avatar">Avatar</TabsTrigger>
            </TabsList>
          </Tabs>
          {/* Spacer for alignment */}
          <div className="ml-4"></div>
        </header>

        {/* Chat/Avatar Area */}
        <div className="flex-1 overflow-y-scroll">
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
                    <div>
                      <div
                        className={`mx-2 p-3 rounded-lg shadow-md ${
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
                      {message.sender !== "user" && (
                        <div className="mt-2 flex justify-end items-center space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-4 h-4"
                                  onClick={() => {
                                    if (speakingMessageId === message.id) {
                                      stopSpeaking(); // Stop ongoing speech
                                      setSpeakingMessageId(null);
                                    } else {
                                      speakMessage(message.content, message.id); // Start speaking
                                    }
                                  }}
                                >
                                  {speakingMessageId === message.id ? (
                                    <AudioLines className="w-4 h-4 text-red-500" />
                                  ) : (
                                    <Volume2 className="w-4 h-4 text-green-500" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>
                                  {speakingMessageId === message.id
                                    ? "Stop"
                                    : "Read aloud"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-4 h-4" // Reduced icon size
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      message.content
                                    );
                                    setCopiedMessageId(message.id);
                                    setTimeout(
                                      () => setCopiedMessageId(null),
                                      5000
                                    ); // Revert after 5 seconds
                                  }}
                                >
                                  {copiedMessageId === message.id ? (
                                    <Check className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <ClipboardCopy className="w-4 h-4 text-blue-500" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>
                                  {copiedMessageId === message.id
                                    ? "Copied!"
                                    : "Copy to clipboard"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
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

        {/* Message Input */}
        <div className="bg-gray-800 p-4 flex items-center shadow-lg">
          <Button
            variant="outline"
            size="icon"
            className={`mr-2`}
            onClick={handleToggleRecording}
          >
            {isRecording ? (
              <CircleStop className={`h-4 w-4 text-red-500 animate-pulse`} />
            ) : (
              <Mic className={`h-4 w-4 text-green-500`} />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="mr-2"
            onClick={() => setIsFileUploadOpen(true)}
          >
            <PaperclipIcon className="h-4 w-4 text-yellow-500" />
          </Button>
          <Input
            className="flex-1 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            placeholder={inputPlaceholder}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button
            className="ml-2 bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-64 bg-gray-800 p-4 flex flex-col shadow-lg">
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
          className="mb-8 bg-gray-700 hover:bg-gray-600 text-white"
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
      <Button className="fixed bottom-4 right-4 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg">
        <Plus className="h-4 w-4" />
      </Button>

      {/* File Upload Modal */}
      <Dialog open={isFileUploadOpen} onOpenChange={setIsFileUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
          </DialogHeader>
          <div className="p-4 border-2 border-dashed border-gray-400 rounded-lg text-center">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-400 mt-2">
              Supported formats: PNG, JPEG, PDF, TXT, Markdown
            </p>
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="outline">Google Drive</Button>
            <Button variant="outline">Paste Link</Button>
            <Button variant="outline">Direct Input</Button>
          </div>
          <div className="mt-4 text-center">
            <Button
              variant="default"
              onClick={handleUpload}
              disabled={loading || !files}
            >
              {loading ? "Uploading..." : "Upload Files"}
            </Button>
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

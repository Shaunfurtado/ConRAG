"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/adv-rag/Sidebar";
import MainContent from "@/components/adv-rag/MainContent";
import RightSidebar from "@/components/adv-rag/RightSideBar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
}

interface ChatHistory {
  id: string;
  title: string;
}

export function AdvancedRagAssistant() {
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [activeProfile, setActiveProfile] = useState<string>("General");
  const [isFileUploadOpen, setIsFileUploadOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const recognitionRef = useRef<any>(null);
  const [inputText, setInputText] = useState<string>("");
  const [inputPlaceholder, setInputPlaceholder] = useState<string>("Type your message...");
  const [messages, setMessages] = useState<Message[]>([{ id: "1", content: "Hello! How can I assist you today?", sender: "ai" }]);
  const [loading, setLoading] = useState<boolean>(false);

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
      const userMessage: Message = { id: Date.now().toString(), content: inputText, sender: "user" };
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
        const aiMessage: Message = { id: Date.now().toString(), content: data.answer || "Sorry, something went wrong.", sender: "ai" };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error("Error fetching AI response:", error);
        setMessages((prevMessages) => [...prevMessages, { id: Date.now().toString(), content: "Error fetching response from server.", sender: "ai" }]);
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

  const handleNewChat = async () => {
    try {
      const response = await fetch("http://localhost:3001/new-conversation", { method: "POST" });
      const data = await response.json();
      setChatHistories((prevHistories) => [...prevHistories, { id: data.id, title: `Chat ${data.id}` }]);
      setSelectedChat(data.id);
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId);
    // Fetch messages for the selected chat from the backend
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar chatHistories={chatHistories} selectedChat={selectedChat} handleNewChat={handleNewChat} handleSelectChat={handleSelectChat} activeProfile={activeProfile} setActiveProfile={setActiveProfile} />
      <MainContent activeTab={activeTab} setActiveTab={setActiveTab} messages={messages} handleSendMessage={handleSendMessage} inputText={inputText} setInputText={setInputText} inputPlaceholder={inputPlaceholder} handleToggleRecording={handleToggleRecording} isRecording={isRecording} setIsFileUploadOpen={setIsFileUploadOpen} />
      <RightSidebar setIsSettingsOpen={setIsSettingsOpen} />
      <Button className="fixed bottom-4 right-4 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg">
        <Plus className="h-4 w-4" />
      </Button>
      <Dialog open={isFileUploadOpen} onOpenChange={setIsFileUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
          </DialogHeader>
          <div className="p-4 border-2 border-dashed border-gray-400 rounded-lg text-center">
            <p>Drag & drop files here, or click to select files</p>
            <p className="text-sm text-gray-400 mt-2">Supported formats: PDF, TXT, Markdown, Audio</p>
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="outline">Google Drive</Button>
            <Button variant="outline">Paste Link</Button>
            <Button variant="outline">Direct Input</Button>
          </div>
        </DialogContent>
      </Dialog>
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
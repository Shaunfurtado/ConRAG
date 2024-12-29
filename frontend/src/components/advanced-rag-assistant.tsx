"use client";
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { ChatHistory } from "./ChatHistory";
import { ProfileSelector } from "./ProfileSelector";
import { MessageDisplay } from "./MessageDisplay";
import { InputArea } from "./InputArea";
import { FileUploadModal } from "./FileUploadModal";
import { SettingsModal } from "./SettingsModal";
import { AvatarView } from "./AvatarView";

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
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", content: "Hello! How can I assist you today?", sender: "ai" },
  ]);
  const [documents, setDocuments] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const [inputText, setInputText] = useState("");
  const [inputPlaceholder, setInputPlaceholder] = useState(
    "Type your message..."
  );
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("http://localhost:3001/documents");
      const data = await response.json();
      setDocuments(data.map((doc: { file_name: string }) => doc.file_name));
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

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
    fetchDocuments();
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

  const handleNewChat = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/new-conversation", {
        method: "POST",
      });
      const data = await response.json();
      setChatHistories((prevHistories) => [
        ...prevHistories,
        { id: data.id, title: `Chat ${data.id}` },
      ]);
      setSelectedChat(data.id);
      setMessages([]);
    } catch (error) {
      console.error("Error creating new chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    setSelectedChat(chatId);
    try {
      const response = await fetch(`http://localhost:3001/chat/${chatId}`);
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "application/pdf",
        "text/plain",
        "text/markdown",
      ];
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

  const handleUpload = async () => {
    if (!files) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload files");

      const data = await response.json();
      if (data) {
        alert("Files uploaded successfully!");
        fetchDocuments();
      } else {
        alert("Error during upload. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Error uploading files. Please try again later.");
    } finally {
      setLoading(false);
      setIsFileUploadOpen(false);
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

  const splitText = (text: string): string[] => {
    return text.match(/[^.!?]+[.!?]+|[^.!?]+/g) || [];
  };

  const speakMessage = (text: string, messageId: string) => {
    const synth = window.speechSynthesis;
    const utterances = splitText(text);
    let currentUtteranceIndex = 0;

    const speakNext = () => {
      if (currentUtteranceIndex < utterances.length) {
        const utterance = new SpeechSynthesisUtterance(
          utterances[currentUtteranceIndex].trim()
        );
        utterance.lang = "en-GB";
        utterance.onend = () => {
          currentUtteranceIndex++;
          speakNext();
        };
        utterance.onerror = (e) => {
          console.error("Speech synthesis error:", e);
          setSpeakingMessageId(null);
        };
        synth.speak(utterance);
      } else {
        setSpeakingMessageId(null);
      }
    };

    synth.cancel();
    setSpeakingMessageId(messageId);
    speakNext();
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
  };

  // Cleanup effect moved outside component body
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopSpeaking();
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 text-black">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-100 p-4 flex flex-col shadow-lg">
        <div className="mb-8">
          <img
            src="/placeholder.svg?height=40&width=40"
            alt="Logo"
            className="h-10 w-10"
          />
        </div>
        <ChatHistory
          chatHistories={chatHistories}
          selectedChat={selectedChat}
          messages={messages}
          loading={loading}
          inputText={inputText}
          setInputText={setInputText}
          handleNewChat={handleNewChat}
          handleSelectChat={handleSelectChat}
          handleSendMessage={handleSendMessage}
        />
        <ProfileSelector
          activeProfile={activeProfile}
          setActiveProfile={setActiveProfile}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto h-full">
        {/* Header */}
        <header className="bg-gray-100 p-4 flex items-center justify-between header shadow-lg">
          <h2 className="text-xl font-bold text-black">AI Assistant</h2>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-64">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="avatar">Avatar</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="ml-4"></div>
        </header>

        {/* Chat/Avatar Area */}
        <div className="flex-1 overflow-y-scroll mt-3">
          {activeTab === "chat" ? (
            messages.map((message) => (
              <MessageDisplay
                key={message.id}
                message={message}
                copiedMessageId={copiedMessageId}
                speakingMessageId={speakingMessageId}
                setCopiedMessageId={setCopiedMessageId}
                speakMessage={speakMessage}
                stopSpeaking={stopSpeaking}
                setSpeakingMessageId={setSpeakingMessageId}
              />
            ))
          ) : (
            <AvatarView setActiveTab={setActiveTab} />
          )}
        </div>

        <InputArea
          inputText={inputText}
          setInputText={setInputText}
          inputPlaceholder={inputPlaceholder}
          handleSendMessage={handleSendMessage}
          isRecording={isRecording}
          handleToggleRecording={handleToggleRecording}
          setIsFileUploadOpen={setIsFileUploadOpen}
        />
      </div>

      {/* Right Sidebar */}
      <div className="w-64 bg-gray-100 p-4 flex flex-col shadow-lg">
        <div className="mb-8">
          <h3 className="mb-2 text-sm font-semibold text-gray-400">Sources</h3>
          <ul className="space-y-2">
          {documents.map((doc, index) => (
              <li
                key={index}
                className="px-2 py-1 rounded hover:bg-gray-200 cursor-pointer"
              >
                {doc}
              </li>
            ))}
          </ul>
        </div>
        <Button
          variant="outline"
          className="mb-8 bg-gray-100 hover:bg-gray-200 text-black"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className="mr-2 h-4 w-4" /> Settings
        </Button>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-black">
            Knowledge Base
          </h3>
          <div className="bg-gray-100 rounded p-2 text-sm text-black">
            Relevant information retrieved during chat would be displayed
            here...
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <Button className="fixed bottom-4 right-4 rounded-full bg-gray-100 hover:bg-gray-200 text-black shadow-lg">
        <Plus className="h-4 w-4" />
      </Button>

      {/* Modals */}
      <FileUploadModal
        isOpen={isFileUploadOpen}
        setIsOpen={setIsFileUploadOpen}
        loading={loading}
        files={files}
        handleFileChange={handleFileChange}
        handleUpload={handleUpload}
      />

      <SettingsModal isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} />
    </div>
  );
}

import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FaPlus } from "react-icons/fa6";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

type ChatHistory = {
  id: string;
  title: string;
};

type Message = {
  id: string;
  content: string;
  sender: "user" | "ai";
};

interface ChatHistoryProps {
  chatHistories: ChatHistory[];
  selectedChat: string | null;
  messages: Message[];
  loading: boolean;
  inputText: string;
  setInputText: (text: string) => void;
  handleNewChat: () => void;
  handleSelectChat: (chatId: string) => void;
  handleSendMessage: () => void;
}

export function ChatHistory({
  chatHistories,
  selectedChat,
  messages,
  loading,
  inputText,
  setInputText,
  handleNewChat,
  handleSelectChat,
  handleSendMessage
}: ChatHistoryProps) {
  return (
    <div className="mb-8">
      <h3 className="mb-2 text-sm font-semibold text-black">Chat History</h3>
      <button
        className="p-1 hover:bg-gray-200 rounded flex items-center space-x-2 border border-b-2"
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
              selectedChat === chat.id ? "bg-white" : "hover:bg-gray-200"
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

      {selectedChat && (
        <div className="mt-6">
          <div className="flex items-center space-x-2 border-b pb-4">
            <Avatar>
              <AvatarImage src="https://via.placeholder.com/150" alt="AI" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <h4 className="text-lg font-semibold">Chat with AI</h4>
          </div>

          <ScrollArea className="mt-4 h-96 space-y-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      message.sender === "user"
                        ? "bg-gray-300 text-black"
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex items-center mt-4 space-x-3">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
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
  );
}
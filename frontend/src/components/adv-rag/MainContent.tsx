import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Volume2, Mic, PaperclipIcon, Send, CircleStop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
}

interface MainContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  messages: Message[];
  handleSendMessage: () => void;
  inputText: string;
  setInputText: (text: string) => void;
  inputPlaceholder: string;
  handleToggleRecording: () => void;
  isRecording: boolean;
  setIsFileUploadOpen: (isOpen: boolean) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  activeTab,
  setActiveTab,
  messages,
  handleSendMessage,
  inputText,
  setInputText,
  inputPlaceholder,
  handleToggleRecording,
  isRecording,
  setIsFileUploadOpen,
}) => (
  <div className="flex-1 flex flex-col overflow-y-auto h-full">
    <header className="bg-gray-800 p-4 flex items-center justify-between header shadow-lg">
      <h2 className="text-xl font-bold text-white">AI Assistant</h2>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-64">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="avatar">Avatar</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="ml-4"></div>
    </header>
    <div className="flex-1 overflow-hidden">
      {activeTab === "chat" ? (
        <ScrollArea className="flex-1 p-4 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} mb-4`}>
              <div className={`flex ${message.sender === "user" ? "flex-row-reverse" : "flex-row"} items-start`}>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={message.sender === "user" ? "/placeholder.svg?height=32&width=32" : "/placeholder.svg?height=32&width=32&text=AI"} />
                  <AvatarFallback>{message.sender === "user" ? "U" : "AI"}</AvatarFallback>
                </Avatar>
                <div className={`mx-2 p-3 rounded-lg shadow-md ${message.sender === "user" ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white"}`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter {...props} children={String(children).replace(/\n$/, "")} style={atomDark} language={match[1]} PreTag="div" />
                      ) : (
                        <code {...props} className={className}>{children}</code>
                      );
                    },
                  }} className="prose dark:prose-invert max-w-none">
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
            <AvatarImage src="/placeholder.svg?height=192&width=192" alt="AI Avatar" />
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
   
    <div className="bg-gray-800 p-4 flex items-center shadow-lg">
      <Button variant="outline" size="icon" className={`mr-2`} onClick={handleToggleRecording}>
        {isRecording ? <CircleStop className={`h-4 w-4 text-red-500 animate-pulse`} /> : <Mic className={`h-4 w-4 text-green-500`} />}
      </Button>
      <Button variant="outline" size="icon" className="mr-2" onClick={() => setIsFileUploadOpen(true)}>
        <PaperclipIcon className="h-4 w-4 text-yellow-500" />
      </Button>
      <Input className="flex-1 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500" placeholder={inputPlaceholder} value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSendMessage()} />
      <Button className="ml-2 bg-blue-500 hover:bg-blue-600 text-white" onClick={handleSendMessage}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

export default MainContent;
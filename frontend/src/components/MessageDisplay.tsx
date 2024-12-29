// First, let's create a types.ts file to share types across components
// types.ts
export type Message = {
    id: string;
    content: string;
    sender: "user" | "ai";
  };
  
  // Then update MessageDisplay.tsx
  import ReactMarkdown from "react-markdown";
  import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
  import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
  import remarkGfm from "remark-gfm";
  import { Volume2, AudioLines, ClipboardCopy, Check } from "lucide-react";
  import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "./ui/tooltip";
  import { Button } from "./ui/button";
  import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";  // Import the Message type
  
  interface MessageDisplayProps {
    message: Message;
    copiedMessageId: string | null;
    speakingMessageId: string | null;
    setCopiedMessageId: (id: string | null) => void;
    speakMessage: (content: string, id: string) => void;
    stopSpeaking: () => void;
    setSpeakingMessageId: (id: string | null) => void;
  }
  
  export function MessageDisplay({
    message,
    copiedMessageId,
    speakingMessageId,
    setCopiedMessageId,
    speakMessage,
    stopSpeaking,
    setSpeakingMessageId
  }: MessageDisplayProps) {
    return (
        <div
        className={`flex mx-2 ${
          message.sender === "user" ? "justify-end" : "justify-start"
        } mb-4`}
      >
        <div
          className={`flex  ${
            message.sender === "user" ? "flex-row-reverse" : "flex-row"
          } items-start`}
        >
          <Avatar className="w-8 h-8 flex-shrink-0">
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
          <div className="max-w-full">
            <div
              className={`mx-2 p-3 rounded-lg shadow-md ${
                message.sender === "user"
                  ? "bg-gray-200 text-black"
                  : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              }`}
              style={{ wordBreak: "break-word" }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        {...props}
                        style={atomDark}
                        language={match[1]}
                        PreTag="div"
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
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
                            stopSpeaking();
                            setSpeakingMessageId(null);
                          } else {
                            speakMessage(message.content, message.id);
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
                        {speakingMessageId === message.id ? "Stop" : "Read aloud"}
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
                        className="w-4 h-4"
                        onClick={() => {
                          navigator.clipboard.writeText(message.content);
                          setCopiedMessageId(message.id);
                          setTimeout(() => setCopiedMessageId(null), 5000);
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
      
    );
  }
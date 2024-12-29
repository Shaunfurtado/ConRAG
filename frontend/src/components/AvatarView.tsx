import { Avatar,AvatarImage,AvatarFallback } from "@radix-ui/react-avatar";
import { Volume2 } from "lucide-react";
import { Button } from "./ui/button";

interface AvatarViewProps {
    setActiveTab: (tab: string) => void;
  }
  
  export function AvatarView({ setActiveTab }: AvatarViewProps) {
    return (
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
    );
  }
  
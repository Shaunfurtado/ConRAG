import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { CircleStop,Mic,PaperclipIcon,Send } from "lucide-react";
interface InputAreaProps {
    inputText: string;
    setInputText: (text: string) => void;
    inputPlaceholder: string;
    handleSendMessage: () => void;
    isRecording: boolean;
    handleToggleRecording: () => void;
    setIsFileUploadOpen: (isOpen: boolean) => void;
  }
  
  export function InputArea({
    inputText,
    setInputText,
    inputPlaceholder,
    handleSendMessage,
    isRecording,
    handleToggleRecording,
    setIsFileUploadOpen
  }: InputAreaProps) {
    return (
      <div className="bg-gray-100 p-4 flex items-center shadow-lg">
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
          className="flex-1 bg-white text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
          placeholder={inputPlaceholder}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <Button
          className="ml-2 bg-black hover:bg-black/80 text-white"
          onClick={handleSendMessage}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  
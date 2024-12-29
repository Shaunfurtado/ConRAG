import { Dialog,DialogContent,DialogHeader,DialogTitle } from "./ui/dialog";


import { Select,SelectTrigger,SelectValue,SelectContent,SelectItem } from "./ui/select";
import { Switch } from "./ui/switch";
interface SettingsModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
  }
  
  export function SettingsModal({ isOpen, setIsOpen }: SettingsModalProps) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
  );
}
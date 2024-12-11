import { FC } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RightSidebarProps {
  setIsSettingsOpen: (isOpen: boolean) => void;
}

const RightSidebar: FC<RightSidebarProps> = ({ setIsSettingsOpen }) => (
  <div className="w-64 bg-gray-800 p-4 flex flex-col shadow-lg">
    <div className="mb-8">
      <h3 className="mb-2 text-sm font-semibold text-gray-400">Sources</h3>
      <ul className="space-y-2">
        {["Doc1", "Doc2", "Doc3"].map((doc) => (
          <li key={doc} className="px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">
            {doc}
          </li>
        ))}
      </ul>
    </div>
    <Button variant="outline" className="mb-8 bg-gray-700 hover:bg-gray-600 text-white" onClick={() => setIsSettingsOpen(true)}>
      <Settings className="mr-2 h-4 w-4" /> Settings
    </Button>
    <div>
      <h3 className="mb-2 text-sm font-semibold text-gray-400">Knowledge Base</h3>
      <div className="bg-gray-700 rounded p-2 text-sm">Relevant information retrieved during chat would be displayed here...</div>
    </div>
  </div>
);

export default RightSidebar;
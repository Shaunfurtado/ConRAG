import React from "react";
import { FaPlus } from "react-icons/fa6";

interface ChatHistory {
  id: string;
  title: string;
}

interface SidebarProps {
  chatHistories: ChatHistory[];
  selectedChat: string | null;
  handleNewChat: () => void;
  handleSelectChat: (chatId: string) => void;
  activeProfile: string;
  setActiveProfile: (profile: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  chatHistories,
  selectedChat,
  handleNewChat,
  handleSelectChat,
  activeProfile,
  setActiveProfile,
}) => (
  <div className="w-64 bg-gray-800 p-4 flex flex-col shadow-lg">
    <div className="mb-8">
      <img src="/placeholder.svg?height=40&width=40" alt="Logo" className="h-10 w-10" />
    </div>
    <div className="mb-8">
      <h3 className="mb-2 text-sm font-semibold text-gray-400">Chat History</h3>
      <button className="p-1 hover:bg-gray-700 rounded flex flex-row space-x-2 border border-b-2" onClick={handleNewChat}>
        <h3>New Chat</h3>
        <FaPlus size={18} className="text-gray-400 mt-1" />
      </button>
      <ul className="space-y-2">
        {chatHistories.map((chat) => (
          <li key={chat.id} className={`px-2 py-1 rounded cursor-pointer ${selectedChat === chat.id ? "bg-blue-600" : "hover:bg-gray-700"}`} onClick={() => handleSelectChat(chat.id)}>
            {chat.title}
          </li>
        ))}
      </ul>
    </div>
    <div>
      <h3 className="mb-2 text-sm font-semibold text-gray-400">Profiles</h3>
      <ul className="space-y-2">
        {["General", "Tutor", "NotesPrep", "Research Ast"].map((profile) => (
          <li key={profile} className={`px-2 py-1 rounded cursor-pointer ${activeProfile === profile ? "bg-blue-600" : "hover:bg-gray-700"}`} onClick={() => setActiveProfile(profile)}>
            {profile}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default Sidebar;
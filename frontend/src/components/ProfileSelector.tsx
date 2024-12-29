interface ProfileSelectorProps {
    activeProfile: string;
    setActiveProfile: (profile: string) => void;
  }
  
  export function ProfileSelector({ activeProfile, setActiveProfile }: ProfileSelectorProps) {
    const profiles = ["General", "Tutor", "NotesPrep", "Research Ast"];
    
    return (
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-400">Profiles</h3>
        <ul className="space-y-2">
          {profiles.map((profile) => (
            <li
              key={profile}
              className={`px-2 py-1 rounded cursor-pointer ${
                activeProfile === profile
                  ? "bg-black text-white"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => setActiveProfile(profile)}
            >
              {profile}
            </li>
          ))}
        </ul>
      </div>
    );
  }
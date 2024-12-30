import { ProfileType } from "./types/profle";

interface ProfileSelectorProps {
  activeProfile: ProfileType;
  setActiveProfile: (profile: ProfileType) => void;
}

export function ProfileSelector({ activeProfile, setActiveProfile }: ProfileSelectorProps) {
  const handleProfileChange = async (profile: ProfileType) => {
    try {
      const response = await fetch('http://localhost:3001/switch-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileName: profile }),
      });

      if (!response.ok) {
        throw new Error('Failed to switch profile');
      }

      setActiveProfile(profile);
    } catch (error) {
      console.error('Error switching profile:', error);
    }
  };

  const profiles: ProfileType[] = ["General", "Tutor", "NotesPrep", "Research Ast"];
  
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
            onClick={() => handleProfileChange(profile)}
          >
            {profile}
          </li>
        ))}
      </ul>
    </div>
  );
}
// PlaylistScreen.tsx
import React from "react";

interface PlaylistScreenProps {
  setToken: React.Dispatch<React.SetStateAction<string>>; // setToken is of type React.Dispatch<React.SetStateAction<string>>
}

const PlaylistScreen: React.FC<PlaylistScreenProps> = ({ setToken }) => {
  const handleLogout = () => {
    // Perform any actions related to logging out using the token if needed
    setToken("");
    window.localStorage.removeItem("token");
  };

  return <button onClick={handleLogout}>Logout from PlaylistScreen</button>;
};

export default PlaylistScreen;

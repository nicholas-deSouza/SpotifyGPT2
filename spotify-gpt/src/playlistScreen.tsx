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

  return (
    <div className="playlist-container">
      <div>
        <h1>What type of music do you want?</h1>
      </div>
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
      <input type="text"></input>
    </div>
  );
};

export default PlaylistScreen;

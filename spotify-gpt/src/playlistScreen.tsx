// PlaylistScreen.tsx
import React from "react";

//npx tsx openai-test.ts
// import * as dotenv from "dotenv";
import OpenAI from "openai";

// dotenv.config();

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY as string,
  dangerouslyAllowBrowser: true,
});

// console.log(chatCompletion.choices[0].message);

interface PlaylistScreenProps {
  setToken: React.Dispatch<React.SetStateAction<string>>; // setToken is of type React.Dispatch<React.SetStateAction<string>>
  token: string;
}

const PlaylistScreen: React.FC<PlaylistScreenProps> = ({ setToken, token }) => {
  const handleLogout = () => {
    // Perform any actions related to logging out using the token if needed
    setToken("");
    window.localStorage.removeItem("token");
  };

  const getUserId = async (): Promise<string> => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const { id } = await response.json();
      console.log("User ID is:", id);

      return id;
    } catch (error) {
      console.error("Error getting user ID:", error);
      throw error;
    }
  };

  const populatePlaylist =
    async (): Promise<OpenAI.Chat.Completions.ChatCompletion> => {
      const userInput = (
        document.getElementById("userInput") as HTMLInputElement
      )?.value;

      // const message =
      //   ". Using the previous sentence, give me songs, do not include the ranking (1. , 2.) before the song name. just include song name. only give me the answer in python list format, no introductory text. song format must be [";
      // (",");
      // ("]");

      const message =
        ".give me songs related to what the previous sentence is about";

      const fullMessage = `${userInput}` + message;

      console.log(fullMessage);

      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: fullMessage }],
      });

      console.log(chatCompletion.choices[0].message.content);
      return chatCompletion;
    };

  const createPlaylist = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const userInput = (document.getElementById("userInput") as HTMLInputElement)
      ?.value;

    // allows for the value of Promise<string> getUserId to be resolved to type string
    getUserId().then((userId) => {
      if (event.key === "Enter") {
        fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: userInput,
            public: false, // Set to false if you want a private playlist
            description: "A description for your playlist",
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            const playlistId = data.id;
            console.log(
              `Playlist "${userInput}" created with ID: ${playlistId}`
            );
          })
          .catch((error) => console.error("Error creating playlist:", error));
        // calls this func only when "enter" is pressed
        populatePlaylist();
      }
    });
  };

  return (
    <div className="playlist-container">
      <div>
        <h1>What type of music do you want?</h1>
      </div>
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
      <input
        type="text"
        id="userInput"
        placeholder="type something"
        onKeyUp={createPlaylist}
      ></input>
    </div>
  );
};

export default PlaylistScreen;

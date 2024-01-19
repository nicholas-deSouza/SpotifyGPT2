// PlaylistScreen.tsx
import React from "react";

//npx tsx openai-test.ts
import OpenAI from "openai";

// dotenv.config();

const getOpenAIKey = async (): Promise<string> => {
  try {
    const response = await fetch("http://localhost:3001/getOpenAIKey");
    const data = await response.json();
    return data["OPENAI_API_KEY"];
  } catch (error) {
    console.error("Error fetching OpenAI API key:", error);
    // You can throw an error or return a default value here
    throw new Error("Failed to fetch OpenAI API key");
  }
};

interface PlaylistScreenProps {
  setToken: React.Dispatch<React.SetStateAction<string>>; // setToken is of type React.Dispatch<React.SetStateAction<string>>
  token: string;
}

const PlaylistScreen: React.FC<PlaylistScreenProps> = ({ setToken, token }) => {
  const handleLogout = () => {
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

  const createPlaylist = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    const userInput = (document.getElementById("userInput") as HTMLInputElement)?.value;

    // allows for the value of Promise<string> getUserId to be resolved to type string
    getUserId().then(async (userId) => {
      if (event.key === "Enter") {
        try {
          const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
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
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          const playlistId = data.id;
          console.log(`Playlist "${userInput}" created with ID: ${playlistId}`);

          // have array of songs and then feed it to getSongInfo

          getOpenAIKey()
            .then(async (apiKey) => {
              const openai = new OpenAI({
                apiKey: apiKey,
                // figure out how to access the env variables without this
                dangerouslyAllowBrowser: true,
              });
              const initialMessage = `Provide a list of 10 songs related to ${userInput} without any rankings or specific order. Simply provide the names of the songs without including the names of the artists.`;

              // openai call
              const chatCompletion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                  {
                    role: "user",
                    content: initialMessage,
                  },
                ],
              });

              // gets content from openai
              const list: string = chatCompletion.choices[0].message.content || "";

              // Process the list as needed
              // Assuming list is in the format '1. Show Me Love\n2. Finally\n3. Your Love\n...'
              const gptList: string[] = list
                .split("\n")
                .map((song) => song.replace(/\d+\./, "").trim());

              // Filter out empty strings or strings that only contain whitespaces
              const filteredList: string[] = gptList.filter((song) => song !== "");

              console.log("Array of songs:", filteredList);

              const listOfSongURIs: string[] = [];

              for (const item of gptList) {
                const getSongInfo = await fetch(
                  `https://api.spotify.com/v1/search?q=${item}&type=track`,
                  {
                    method: "GET",
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                  }
                );

                if (!getSongInfo.ok) {
                  throw new Error(`HTTP error! Status: ${getSongInfo.status}`);
                }

                const songInfoData = await getSongInfo.json();

                const firstTrack = songInfoData.tracks.items[0];

                if (firstTrack) {
                  const songURI = firstTrack.uri;
                  listOfSongURIs.push(songURI);

                  // prints out song URIs for each song
                  console.log(`List of URIs for ${item}:`, [songURI]);
                }
              }

              const addToPlaylist = await fetch(
                `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    uris: listOfSongURIs,
                  }),
                }
              );

              if (!addToPlaylist.ok) {
                throw new Error(`HTTP error! Status: ${addToPlaylist.status}`);
              }
            })
            .catch((error) => {
              console.error("Failed to fetch data:", error.message);
            });
        } catch (error) {
          console.error("Error:", error);
        }
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

// PlaylistScreen.tsx
import React, { useState } from "react";

//npx tsx openai-test.ts
import OpenAI from "openai";

// dotenv.config();

const getOpenAIKey = async (): Promise<string> => {
  try {
    const response = await fetch(
      "https://ov4ynhavt2h5f5hjlraob7z5fu0yugpw.lambda-url.us-east-2.on.aws/getOpenAIKey"
    );
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
  const [loading, setLoading] = useState(false);
  const [playlistDone, setPlaylistDone] = useState(false);

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
      // console.log("User ID is:", id);

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
        setLoading(true);
        try {
          const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              name: userInput || "Default Playlist Name", // Use a default name if userInput is empty
              // https://community.spotify.com/t5/Spotify-for-Developers/Api-to-create-a-private-playlist-doesn-t-work/td-p/5407807
              public: false, // spotify will show it as a "public playlist" but it won't be showing on profile
              description: userInput
                ? "Created with the SpotifyGPT App ❤️"
                : "Default Playlist Description", // Provide a default description if userInput is empty
            }),
          });

          // console.log("Request payload:", JSON.stringify);

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          const playlistId = data.id;
          // console.log(`Playlist "${userInput}" created with ID: ${playlistId}`);

          // have array of songs and then feed it to getSongInfo

          getOpenAIKey()
            .then(async (apiKey) => {
              const openai = new OpenAI({
                apiKey: apiKey,
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
                  // console.log(`List of URIs for ${item}:`, [songURI]);
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

              setLoading(false);
              // shows message that playlist is ready and then changes screen to show text box again
              setPlaylistDone(true);
              setTimeout(() => {
                setPlaylistDone(false);
              }, 2000);

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
      {!loading && !playlistDone ? (
        <div>
          <div>
            <h1>What type of music do you want?</h1>
          </div>
          <div>
            <h2>Your playlist's name will be whatever you enter in the field below.</h2>
          </div>
          <input
            type="text"
            id="userInput"
            placeholder="Type something and then press enter!"
            onKeyUp={createPlaylist}
          ></input>
        </div>
      ) : (
        <div>
          {loading ? (
            <div>Creating your playlist and populating it with music. 😎</div>
          ) : (
            <div>Playlist is ready! You can use it now. 🎶</div>
          )}
        </div>
      )}
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
      <div>
        <a href="#" onClick={handleLogout}>
          <img className="logout-icon" src="/img/Logout.svg" alt="Logout" />
        </a>
      </div>
    </div>
  );
};

export default PlaylistScreen;

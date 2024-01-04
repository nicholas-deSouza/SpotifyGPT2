// PlaylistScreen.tsx
import React from "react";

//npx tsx openai-test.ts
// import * as dotenv from "dotenv";
import OpenAI from "openai";

// dotenv.config();

// Replace with the track URIs

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY as string,
  // figure out how to access the env variables without this
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

          // User-provided message to initiate the conversation
          const initialMessage =
            "Provide a list of 10 gym songs without any rankings or specific order. Simply provide the names of the songs without including the names of the artists.";

          // Make the OpenAI API call with the initial message
          const chatCompletion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: initialMessage,
              },
            ],
          });

          // Extract the content from the model's response
          const list: string = chatCompletion.choices[0].message.content || "";

          // Process the list as needed
          // Assuming list is in the format '1. Show Me Love\n2. Finally\n3. Your Love\n...'
          const gptList: string[] = list
            .split("\n")
            .map((song) => song.replace(/\d+\./, "").trim());

          // Filter out empty strings or strings that only contain whitespaces
          const filteredList: string[] = gptList.filter((song) => song !== "");

          console.log("Array of songs:", filteredList);

          // .map((gptList) => gptList.replace(/\d+\./g, "").trim());

          // console.log("Trimmed list:", gptList.join("\n"));

          // const listOfSongs: string[] = ["Escape", "Strobe"];
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

              // Log information for the current item
              console.log(`List of URIs for ${item}:`, [songURI]);
            }
          }

          // Now, listOfSongURIs contains the information for all items in listOfSongs
          // console.log("Final List of Songs:", listOfSongURIs);

          // // gets track info

          // console.log("List of Songs:", listOfSongURIs);

          // const songInfoURI = songInfoData["tracks"]["items"][0]["uri"];
          // console.log("Song URI is:", songInfoURI);

          // create array that will store all the song URIs

          // console.log("Song Information:", songInfoData);

          // adds songs to playlist generated above
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

          // Calls this function only when "enter" is pressed
          // populatePlaylist();
        } catch (error) {
          console.error("Error:", error);
        }
      }
    });
  };

  // const populatePlaylist = async (): Promise<OpenAI.Chat.Completions.ChatCompletion> => {
  //   const userInput = (document.getElementById("userInput") as HTMLInputElement)?.value;

  //   // format of the response should be
  //   // 1. song1
  //   // 2. song2

  //   const songNames = [];

  //   console.log(chatCompletion.choices[0].message.content);

  //   songNames.push(chatCompletion.choices[0].message.content);
  //   console.log(songNames);

  //   return chatCompletion;
  // };

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

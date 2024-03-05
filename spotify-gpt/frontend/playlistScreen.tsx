// PlaylistScreen.tsx
import React, { useState } from "react";

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

      return id;
    } catch (error) {
      console.error("Error getting user ID:", error);
      throw error;
    }
  };

  const createPlaylist = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userInput = (document.getElementById("userInput") as HTMLInputElement)?.value;

    // allows for the value of Promise<string> getUserId to be resolved to type string
    getUserId().then(async (userId) => {
      setLoading(true);
      try {
        const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: userInput || "Default Playlist Name",
            public: false,
            description: userInput
              ? "Created with the SpotifyGPT App ❤️"
              : "Default Playlist Description",
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const playlistId = data.id;

        // Fetch data from backend
        let songList;
        try {
          const backendResponse = await fetch("http://localhost:3001/ListOfSongs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userInput }),
          });

          if (!backendResponse.ok) {
            throw new Error("Network response was not ok");
          }

          const open = await backendResponse.json();
          songList = open.gptList;
          // Process the data received from the backend
        } catch (error) {
          console.error("There was a problem with the fetch operation:", error);
        }

        const listOfSongURIs: string[] = [];
        for (const item of songList) {
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
        }, 3000);

        if (!addToPlaylist.ok) {
          throw new Error(`HTTP error! Status: ${addToPlaylist.status}`);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error.message);
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
          <form onSubmit={createPlaylist}>
            <input type="text" id="userInput" placeholder="Type something and then press enter!" />
          </form>
        </div>
      ) : (
        <div>
          {loading ? (
            <div>
              <h2>Creating your playlist and populating it with music. 😎</h2>
            </div>
          ) : (
            <div>
              <h2>Playlist is ready! You can use it now. 🎶</h2>
            </div>
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

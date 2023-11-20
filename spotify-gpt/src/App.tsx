import { useState } from "react";
import PlaylistScreen from "./playlistScreen";
import HomeScreen from "./homeScreen";

function App() {
  const CLIENT_ID = "c5b92af7cda34c69a72b9d00cd7e0834";
  const REDIRECT_URI = "http://localhost:5173";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";

  const [token, setToken] = useState<string>(""); // Specify the type explicitly as 'string'

  return (
    <div className="app">
      <div className="center-content">
        <h1>Spotify React</h1>
        {!token ? (
          <HomeScreen
            CLIENT_ID={CLIENT_ID}
            REDIRECT_URI={REDIRECT_URI}
            AUTH_ENDPOINT={AUTH_ENDPOINT}
            RESPONSE_TYPE={RESPONSE_TYPE}
            setToken={setToken}
          />
        ) : (
          <div>
            <PlaylistScreen setToken={setToken} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

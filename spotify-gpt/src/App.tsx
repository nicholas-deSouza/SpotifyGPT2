import { useState, useEffect } from "react";

function App() {
  const CLIENT_ID = "c5b92af7cda34c69a72b9d00cd7e0834";
  const REDIRECT_URI = "http://localhost:5173";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";

  const [token, setToken] = useState<string>(""); // Specify the type explicitly as 'string'

  useEffect(() => {
    const hash = window.location.hash;
    const storedToken = window.localStorage.getItem("token") || ""; // Default to empty string if null

    if (!storedToken && hash) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get("access_token");

      if (accessToken) {
        window.location.hash = "";
        window.localStorage.setItem("token", accessToken);
        setToken(accessToken);
      }
    } else {
      setToken(storedToken);
    }
  }, []);

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  };

  return (
    <div className="app">
      <div className="center-content">
        <h1>Spotify React</h1>
        {!token ? (
          <button>
            <a
              href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}
            >
              Login
            </a>
          </button>
        ) : (
          <button onClick={logout}>Logout</button>
        )}
      </div>
    </div>
  );
}

export default App;

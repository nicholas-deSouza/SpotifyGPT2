import React, { useEffect } from "react";

interface HomeScreenProps {
  CLIENT_ID: string;
  REDIRECT_URI: string;
  AUTH_ENDPOINT: string;
  RESPONSE_TYPE: string;
  SCOPE: string;
  SHOW_DIALOG: string;
  setToken: React.Dispatch<React.SetStateAction<string>>; // setToken is of type React.Dispatch<React.SetStateAction<string>>
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  CLIENT_ID,
  REDIRECT_URI,
  AUTH_ENDPOINT,
  RESPONSE_TYPE,
  SCOPE,
  SHOW_DIALOG,
  setToken,
}) => {
  const handleLogin = () => {
    const hash = window.location.hash;
    const storedToken = window.localStorage.getItem("token") || ""; // Default to empty string if null
    // const userName = window.localStorage.getItem("username") || "";

    if (!storedToken && hash) {
      const hashParams = new URLSearchParams(hash.substring(1));

      const accessToken = hashParams.get("access_token");

      if (accessToken) {
        window.location.hash = "";
        window.localStorage.setItem("token", accessToken);
        // window.localStorage.setItem("name", userName);
        setToken(accessToken);
      }
    } else {
      setToken(storedToken);
    }
  };

  // seperate function to handle changing the page using onClick()
  const changePage = () => {
    window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}&show_dialog=${SHOW_DIALOG}`;
  };

  useEffect(() => {
    handleLogin();
  }, []);

  return (
    <div className="home-screen-container">
      <h1> Welcome to the SpotifyGPT Playlist Generator!</h1>
      <h2> Click the button below to get started on generating your playlist </h2>
      <button
        className="login-button"
        onClick={() => {
          handleLogin();
          changePage();
        }}
      >
        Login
      </button>
    </div>
  );
};

export default HomeScreen;

import React, { useEffect } from "react";

interface HomeScreenProps {
  CLIENT_ID: string;
  REDIRECT_URI: string;
  AUTH_ENDPOINT: string;
  RESPONSE_TYPE: string;
  setToken: React.Dispatch<React.SetStateAction<string>>; // setToken is of type React.Dispatch<React.SetStateAction<string>>
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  CLIENT_ID,
  REDIRECT_URI,
  AUTH_ENDPOINT,
  RESPONSE_TYPE,
  setToken,
}) => {
  const handleLogin = () => {
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
  };

  // seperate function to handle changing the page using onClick()
  const changePage = () => {
    window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`;
  };

  useEffect(() => {
    handleLogin();
  }, []);

  return (
    <button
      onClick={() => {
        handleLogin();
        changePage();
      }}
    >
      Login
    </button>
  );
};

export default HomeScreen;

import React, { useState, useEffect } from "react";
import mockUser from "./mockData.js/mockUser";
import mockRepos from "./mockData.js/mockRepos";
import mockFollowers from "./mockData.js/mockFollowers";
import axios from "axios";
import { PropTypes } from "prop-types";

const rootUrl = "https://api.github.com";
const searchUserUrl = "https://api.github.com/users/";
// wesbos

const GithubContext = React.createContext();

const GithubProvider = ({ children }) => {
  const [gitHubUser, setGitHubUser] = useState(mockUser);
  const [repos, setRepos] = useState(mockRepos);
  const [followers, setFollowers] = useState(mockFollowers);
  // request loading
  const [requests, setRequests] = useState(0);
  const [loading, seIsLoading] = useState(true);
  const [error, setError] = useState({ show: false, msg: "" });

  const searchGitHubUser = async (user) => {
    toggleError();
    // setLoading(true)
    try {
      const response = await axios(`${searchUserUrl}${user}`);
      const userData = response.data;
      console.log(userData);
      setGitHubUser(userData);
    } catch (error) {
      console.log(error);
      toggleError(true, "there is no user with that username");
    }
  };

  // check rate
  const checkRequest = () => {
    axios(`${rootUrl}/rate_limit`)
      .then(({ data }) => {
        let {
          rate: { remaining },
        } = data;
        setRequests(remaining);
        if (remaining === 0) {
          toggleError(true, "sorry, you have exceeded your hourly rate limit!");
          console.log(error);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // error
  function toggleError(show = false, msg = "") {
    setError({ show, msg });
  }

  useEffect(checkRequest, []);

  return (
    <GithubContext.Provider
      value={{
        gitHubUser,
        repos,
        followers,
        requests,
        error,
        searchGitHubUser,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

GithubProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { GithubProvider, GithubContext };

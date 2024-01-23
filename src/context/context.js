import React, { useState, useEffect } from "react";
import mockUser from "./mockData.js/mockUser";
import mockRepos from "./mockData.js/mockRepos";
import mockFollowers from "./mockData.js/mockFollowers";
import axios from "axios";
import { PropTypes } from "prop-types";

const rootUrl = "https://api.github.com";
const searchUserUrl = "https://api.github.com/users/";

const GithubContext = React.createContext();

const GithubProvider = ({ children }) => {
  const [gitHubUser, setGitHubUser] = useState(mockUser);
  const [repos, setRepos] = useState(mockRepos);
  const [followers, setFollowers] = useState(mockFollowers);
  // request loading
  const [requests, setRequests] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({ show: false, msg: "" });

  const searchGitHubUser = async (user) => {
    toggleError();
    setIsLoading(true);
    try {
      // * user
      const userResponse = await axios(`${searchUserUrl}${user}`);
      const userData = userResponse.data;
      setGitHubUser(userData);
      // * repos
      const reposResponse = await axios(
        `https://api.github.com/users/${user}/repos?per_page=100`
      );
      const reposData = reposResponse.data;
      setRepos(reposData);
      // * followers
      const followersResponse = await axios(
        `https://api.github.com/users/${user}/followers`
      );
      const followersData = followersResponse.data;
      setFollowers(followersData);
    } catch (error) {
      console.log(error);
      toggleError(true, "there is no user with that username");
    }
    setIsLoading(false);
    checkRequest();
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

  useEffect(() => {
    searchGitHubUser("carlosazaustre");
  }, []);

  return (
    <GithubContext.Provider
      value={{
        gitHubUser,
        repos,
        followers,
        requests,
        error,
        searchGitHubUser,
        isLoading,
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

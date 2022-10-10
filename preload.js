const Twitter = require("twitter");
// プリロード (隔離ワールド), リンクをブラウザで開く
const { contextBridge, ipcRenderer, shell } = require("electron");

const client = new Twitter({
  consumer_key: process.env.TWITTER_CLIENT_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CLIENT_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_CLIENT_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_CLIENT_ACCESS_TOKEN_SECRET,
});

/**
 * Twitter API関連の定義
 */
const endpoint = {
  getTweets: "statuses/home_timeline",
  fav: "favorites/create",
};
const getTweets = async () => {
  const params = {};
  tweets = await client.get(endpoint.getTweets, params);
  return tweets;
};
const fav = async (id_str) => {
  const params = { id: id_str };
  result = await client.post(endpoint.fav, params);
  return result;
};

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});

contextBridge.exposeInMainWorld("api", {
  getTweets: async (data) => {
    const tweets = await getTweets();
    console.log(tweets);
    return tweets;
  },
  fav: async (id_str) => {
    console.log("fav signal received", id_str);
    const result = await fav(id_str);
    return result;
  },
  shell: shell,
});

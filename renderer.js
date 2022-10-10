// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

/**
 * 単一のツイートのデータから画面を描画する
 * @param {tweet} ツイートのデータ
 * @param {shell} リンクをブラウザで開くためのパッケージ
 */
const repaint = (tweet, shell) => {
  // textの短縮URLを展開する
  let displayText = tweet.text;
  tweet.entities.urls.forEach((url) => {
    displayText = displayText.replace(url.url, url.display_url);
  });
  if (tweet.entities.media !== undefined) {
    // mediaはないことがある
    tweet.entities.media.forEach((media) => {
      displayText = displayText.replace(media.url, media.display_url);
    });
  }

  // 日付の展開
  // Before: Mon Oct 10 02:09:09 +0000 2022
  // After:  2022/10/10 11:09:09
  const parsedDate = new Date(tweet.created_at);
  const parsedDateYear = parsedDate.getFullYear();
  const parsedDateMonth = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const parsedDateDay = String(parsedDate.getDate()).padStart(2, "0");
  const parsedDateHour = String(parsedDate.getHours()).padStart(2, "0");
  const parsedDateMinute = String(parsedDate.getMinutes()).padStart(2, "0");
  const parsedDateSecond = String(parsedDate.getSeconds()).padStart(2, "0");
  const formattedCreatedAt = [
    `${parsedDateYear}/${parsedDateMonth}/${parsedDateDay}`,
    `${parsedDateHour}:${parsedDateMinute}:${parsedDateSecond}`,
  ].join(" ");

  // 画像があったら1枚目を表示する
  let imageUrl = "";
  const imageElement = document.querySelector(".image");
  const hasImage = tweet.entities.media !== undefined;
  if (hasImage) {
    imageElement.style.visibility = "visible";
    imageUrl = tweet.entities.media[0].media_url_https;
  } else {
    imageElement.style.visibility = "hidden";
  }

  document.querySelector(".icon").src = tweet.user.profile_image_url_https;
  document.querySelector(".name").innerHTML = `@${tweet.user.screen_name}`;
  document.querySelector(".info").innerHTML = formattedCreatedAt;
  document.querySelector(".text").innerHTML = displayText;
  imageElement.src = imageUrl;

  /**
   * トーストを表示
   * @param {text} 表示したいテキスト
   */
  const toast = (text) => {
    const aToast = document.querySelector(".toast");
    aToast.innerHTML = text;
    aToast.style.visibility = "visible";
    setTimeout(() => {
      aToast.style.visibility = "hidden";
    }, 3000);
  };

  // ユーザ名をクリックしたらブラウザで投稿者のTwitterを開く
  document.querySelector(".name").onclick = () => {
    const url = `https://twitter.com/${tweet.user.screen_name}`;
    shell.openExternal(url);
  };

  // 投稿日時をクリックしたらブラウザでそのツイートを開く
  document.querySelector(".info").onclick = () => {
    const url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
    shell.openExternal(url);
  };

  // ふぁぼ
  document.querySelector(".fav").onclick = async () => {
    const result = await window.api.fav(tweet.id_str);
    if (tweet.id_str === result.id_str) {
      console.log(`successfully added to fav tweet ${tweet.id_str}`);
      toast("added to fav");
    } else {
      toast("fav failed. there seemed to have an error.");
    }
  };
};

const main = async () => {
  const tweets = await window.api.getTweets();
  console.log(tweets);

  // リンクをブラウザで開くためのパッケージ
  const shell = window.api.shell;

  let i = 0;
  repaint(tweets[0], shell); // 最初の描画
  setInterval(() => {
    // タイマーで1件ずつ表示
    // 最後まで来たらウィンドウを更新する
    if (i === tweets.length) {
      window.location.reload();
    }
    repaint(tweets[i], shell);
    i++;
  }, 12000);
};

main();

import Arena from "are.na";
import "dotenv/config";

const API_KEY = process.env.NEYNAR_API_KEY;
const CHANNEL_ID = "esoteric";
const FETCH_LIMIT = 100;
const URL_DOMAIN_FILTER = "imagedelivery.net";
const ARENA_CHANNEL_ID = "esoteric-rpqjvzcz6tw";
const arena = new Arena({ accessToken: process.env.ARENA_ACCESS_TOKEN });

const options = {
  method: "GET",
  headers: { accept: "application/json", api_key: API_KEY },
};

function createArenaBlock(url) {
  const newBlock = {
    content: url,
  };

  arena
    .channel(ARENA_CHANNEL_ID)
    .createBlock(newBlock)
    .then(() => {
      console.log(`Block created for URL: ${url}`);
    })
    .catch((err) => {
      console.error(`Error creating block for URL: ${url}`, err);
    });
}

function fetchCasts(cursor = "") {
  const cursorParam = cursor ? `&cursor=${encodeURIComponent(cursor)}` : "";
  const url = `https://api.neynar.com/v2/farcaster/feed/channels?channel_ids=${CHANNEL_ID}&with_recasts=false&viewer_fid=3&with_replies=false&limit=${FETCH_LIMIT}${cursorParam}&should_moderate=false`;

  fetch(url, options)
    .then((response) => response.json())
    .then((data) => {
      if (!data.casts || !Array.isArray(data.casts)) {
        return;
      }

      const casts = data.casts;
      const imgURLS = casts
        .flatMap((cast) => cast.embeds ?? [])
        .map((embed) => embed.url)
        .filter((url) => url && url.includes(URL_DOMAIN_FILTER));

      imgURLS.forEach((url) => {
        createArenaBlock(url);
      });

      if (data.next && data.next.cursor) {
        fetchCasts(data.next.cursor);
      }
    })
    .catch((err) => console.error(err));
}
fetchCasts();

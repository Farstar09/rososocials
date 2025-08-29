// X (Twitter) latest tweet checker (requires v2 bearer token, paid tiers)
import fetch from 'node-fetch';
import { readState, writeState } from '../storage.js';
import { config } from '../config.js';

export async function checkXPost() {
  if (!config.x.userId || !config.x.bearerToken) return null;
  const url = new URL(`https://api.twitter.com/2/users/${config.x.userId}/tweets`);
  url.searchParams.set('max_results', '5');
  url.searchParams.set('exclude', 'replies,retweets');
  url.searchParams.set('tweet.fields', 'created_at,entities');
  const res = await fetch(url, { headers: { Authorization: `Bearer ${config.x.bearerToken}` } });
  if (!res.ok) return null;
  const json = await res.json();
  const tweet = json.data?.[0];
  if (!tweet) return null;

  const state = readState();
  if (state.x?.lastTweetId === tweet.id) return null;

  state.x.lastTweetId = tweet.id;
  writeState(state);

  const urlPost = `https://x.com/i/web/status/${tweet.id}`;
  return {
    type: 'x_post',
    title: tweet.text?.slice(0, 120) || 'New post on X',
    url: urlPost,
    timestamp: tweet.created_at
  };
}

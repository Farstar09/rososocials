// Instagram latest post checker (Graph API - Business/Creator accounts only)
import fetch from 'node-fetch';
import { readState, writeState } from '../storage.js';
import { config } from '../config.js';

export async function checkInstagramPost() {
  if (!config.instagram.userId || !config.instagram.accessToken) return null;
  const url = new URL(`https://graph.instagram.com/${config.instagram.userId}/media`);
  url.searchParams.set('fields', 'id,caption,permalink,media_type,media_url,timestamp');
  url.searchParams.set('access_token', config.instagram.accessToken);
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  const item = json.data?.[0];
  if (!item) return null;

  const state = readState();
  if (state.instagram?.lastMediaId === item.id) return null;

  state.instagram.lastMediaId = item.id;
  writeState(state);

  return {
    type: 'instagram_post',
    title: item.caption?.slice(0, 100) || 'New Instagram post',
    url: item.permalink,
    thumbnail: item.media_url,
    timestamp: item.timestamp
  };
}

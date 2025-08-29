// Twitch live checker
import fetch from 'node-fetch';
import { readState, writeState } from '../storage.js';
import { config } from '../config.js';

let accessToken = null;
let tokenExpiry = 0;

async function getAppToken() {
  const now = Date.now();
  if (accessToken && now < tokenExpiry - 60_000) return accessToken;
  const params = new URLSearchParams({
    client_id: config.twitch.clientId,
    client_secret: config.twitch.clientSecret,
    grant_type: 'client_credentials'
  });
  const res = await fetch('https://id.twitch.tv/oauth2/token', { method: 'POST', body: params });
  if (!res.ok) throw new Error('Twitch token error');
  const data = await res.json();
  accessToken = data.access_token;
  tokenExpiry = now + (data.expires_in * 1000);
  return accessToken;
}

export async function checkTwitchLive() {
  if (!config.twitch.clientId || !config.twitch.clientSecret) return null;
  const token = await getAppToken();
  const url = new URL('https://api.twitch.tv/helix/streams');
  url.searchParams.set('user_login', config.twitch.username);
  const res = await fetch(url, {
    headers: {
      'Client-ID': config.twitch.clientId,
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) return null;
  const json = await res.json();
  const live = json.data?.[0];
  const state = readState();
  const wasLive = state.twitch?.lastLive;
  const lastStreamId = state.twitch?.lastStreamId || null;

  if (live) {
    const streamId = live.id;
    // Notify if transitioned from offline->live OR new stream id
    if (!wasLive || streamId !== lastStreamId) {
      state.twitch.lastLive = true;
      state.twitch.lastStreamId = streamId;
      writeState(state);
      const title = live.title || 'Live on Twitch!';
      const url = `https://www.twitch.tv/${config.twitch.username}`;
      return {
        type: 'twitch_live',
        title,
        url,
        game: live.game_name,
        startedAt: live.started_at,
        thumbnail: live.thumbnail_url?.replace('{width}', '1280')?.replace('{height}', '720')
      };
    } else {
      // still live, no new notification
      return null;
    }
  } else {
    // transitioned to offline
    if (wasLive) {
      state.twitch.lastLive = false;
      writeState(state);
    }
    return null;
  }
}

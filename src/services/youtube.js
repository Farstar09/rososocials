// YouTube latest upload checker
import fetch from 'node-fetch';
import { readState, writeState } from '../storage.js';
import { config } from '../config.js';

async function resolveChannelId() {
  if (config.youtube.channelId) return config.youtube.channelId;
  if (!config.youtube.apiKey || !config.youtube.channelHandle) return null;
  const url = new URL('https://www.googleapis.com/youtube/v3/channels');
  url.searchParams.set('part', 'id');
  url.searchParams.set('forHandle', config.youtube.channelHandle);
  url.searchParams.set('key', config.youtube.apiKey);
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  return json.items?.[0]?.id || null;
}

export async function checkYouTubeUpload() {
  if (!config.youtube.apiKey) return null;
  const channelId = await resolveChannelId();
  if (!channelId) return null;

  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('channelId', channelId);
  url.searchParams.set('order', 'date');
  url.searchParams.set('maxResults', '1');
  url.searchParams.set('type', 'video');
  url.searchParams.set('key', config.youtube.apiKey);

  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  const item = json.items?.[0];
  if (!item) return null;

  const videoId = item.id?.videoId;
  const state = readState();
  if (state.youtube?.lastVideoId === videoId) return null;

  // update state and notify
  state.youtube.lastVideoId = videoId;
  writeState(state);

  const title = item.snippet?.title || 'New YouTube upload';
  const urlVideo = `https://www.youtube.com/watch?v=${videoId}`;
  const publishedAt = item.snippet?.publishedAt;
  const thumb = item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url;
  return {
    type: 'youtube_upload',
    title,
    url: urlVideo,
    publishedAt,
    thumbnail: thumb
  };
}

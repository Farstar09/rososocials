import { config } from './config.js';
import fs from 'fs';

function ensureFile() {
  try {
    fs.mkdirSync(new URL('../data', import.meta.url).pathname, { recursive: true });
  } catch {}
  if (!fs.existsSync(config.storagePath)) {
    fs.writeFileSync(config.storagePath, JSON.stringify({
      twitch: { lastLive: false, lastStreamId: null },
      youtube: { lastVideoId: null },
      instagram: { lastMediaId: null },
      x: { lastTweetId: null },
      tiktok: { lastItemId: null }
    }, null, 2));
  }
}

export function readState() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(config.storagePath, 'utf8'));
  } catch {
    return { twitch: {}, youtube: {}, instagram: {}, x: {}, tiktok: {} };
  }
}

export function writeState(newState) {
  ensureFile();
  fs.writeFileSync(config.storagePath, JSON.stringify(newState, null, 2));
}

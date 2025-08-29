// TikTok latest post checker via RSS (e.g., RSSHub). Provide TIKTOK_RSS env var.
import Parser from 'rss-parser';
import { readState, writeState } from '../storage.js';
import { config } from '../config.js';

const parser = new Parser();

export async function checkTikTokPost() {
  if (!config.tiktok.rssUrl) return null;
  try {
    const feed = await parser.parseURL(config.tiktok.rssUrl);
    const item = feed.items?.[0];
    if (!item) return null;
    const idGuess = item.guid || item.link || item.id || item.title;
    const state = readState();
    if (state.tiktok?.lastItemId === idGuess) return null;
    state.tiktok.lastItemId = idGuess;
    writeState(state);

    return {
      type: 'tiktok_post',
      title: item.title?.slice(0, 100) || 'New TikTok',
      url: item.link,
      timestamp: item.isoDate
    };
  } catch {
    return null;
  }
}

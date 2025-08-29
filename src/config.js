import 'dotenv/config';

export const config = {
  discordToken: process.env.DISCORD_TOKEN,
  channelId: process.env.DISCORD_CHANNEL_ID,
  // Twitch
  twitch: {
    clientId: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET,
    username: process.env.TWITCH_USERNAME || 'rosoesports',
    pollMs: 60_000
  },
  // YouTube
  youtube: {
    apiKey: process.env.YT_API_KEY,
    channelHandle: process.env.YT_CHANNEL_HANDLE,
    channelId: process.env.YT_CHANNEL_ID,
    pollMs: 300_000
  },
  // Instagram (Graph API)
  instagram: {
    userId: process.env.IG_USER_ID,
    accessToken: process.env.IG_ACCESS_TOKEN,
    pollMs: 600_000
  },
  // X (Twitter) v2
  x: {
    userId: process.env.X_USER_ID,
    bearerToken: process.env.X_BEARER_TOKEN,
    pollMs: 300_000
  },
  // TikTok via RSS
  tiktok: {
    rssUrl: process.env.TIKTOK_RSS,
    pollMs: 600_000
  },
  storagePath: new URL('../data/state.json', import.meta.url).pathname
};

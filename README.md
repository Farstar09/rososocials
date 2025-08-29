# ROSO Socials Bot

A Discord bot that posts in your socials-feed channel whenever you:
- go live on **Twitch**
- upload a new **YouTube** video
- (optional) post on **Instagram** (Graph API, Business/Creator only)
- (optional) post on **X (Twitter)** (v2 API, paid tiers)
- (optional) post on **TikTok** (via RSS feed, e.g., RSSHub)

> Out of the box Twitch + YouTube are supported with official APIs. The others are optional.

---

## Quick Start

1) **Create a Discord bot** and invite it with the `bot` scope and `Send Messages` permission.
2) Copy `.env.example` to `.env` and fill in values:
   - `DISCORD_TOKEN` – your bot token
   - `DISCORD_CHANNEL_ID` – the target #socials-feed channel ID
   - **Twitch**: `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `TWITCH_USERNAME`
   - **YouTube**: `YT_API_KEY`, and set `YT_CHANNEL_HANDLE` (e.g., `RosoEsports`) *or* `YT_CHANNEL_ID`
   - **Instagram** (optional): `IG_USER_ID`, `IG_ACCESS_TOKEN`
   - **X / Twitter** (optional): `X_USER_ID`, `X_BEARER_TOKEN`
   - **TikTok** (optional): set `TIKTOK_RSS` to an RSS feed URL (e.g., from RSSHub)
3) Install deps and run:
```bash
npm install
npm run start
```

### Finding IDs
- **Discord channel ID**: Enable Developer Mode → right‑click the channel → Copy ID.
- **YouTube**: Either provide `YT_CHANNEL_ID`, or just set `YT_CHANNEL_HANDLE` and the bot will resolve it.
- **Twitch username**: your channel handle, e.g., `rosoesports`.

### What it does
- Polls Twitch every 60s to detect offline→live transitions and posts an embed.
- Polls YouTube every 5 min for the latest upload and posts once per new video.
- Optional: polls IG (10 min), X (5 min), and TikTok RSS (10 min).

### State / Deduplication
The bot stores the latest seen IDs in `data/state.json` to avoid duplicate posts.

### Hosting notes
- **Replit** / **Railway** / **Render** / **Docker** are fine. Keep the process alive.
- If your host sleeps, the first check on wake may post if it missed an event.
- You can adjust polling intervals in `src/config.js`.

---

## Troubleshooting

- Nothing posts? Check the console logs first.
- Twitch 401: verify `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET`, and that the app token is being created.
- YouTube 403/400: ensure the API key has YouTube Data API v3 enabled and `YT_CHANNEL_*` is set.
- Instagram/X/TikTok are optional and require proper tokens or RSS feeds.

---

## Credits
Built for ROSO by ChatGPT (Star 🤝). Enjoy!

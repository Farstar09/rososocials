import { Client, GatewayIntentBits, EmbedBuilder, Partials } from 'discord.js';
import { config } from './config.js';
import { readState } from './storage.js';
import { checkTwitchLive } from './services/twitch.js';
import { checkYouTubeUpload } from './services/youtube.js';
import { checkInstagramPost } from './services/instagram.js';
import { checkXPost } from './services/x.js';
import { checkTikTokPost } from './services/tiktok.js';

if (!config.discordToken || !config.channelId) {
  console.error('Missing DISCORD_TOKEN or DISCORD_CHANNEL_ID in .env');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel]
});

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  scheduleAll();
  // Run once on boot (stagger to avoid rate spikes)
  setTimeout(runCheck, 2000);
});

client.login(config.discordToken);

// Scheduling
function scheduleAll() {
  if (config.twitch.clientId && config.twitch.clientSecret) {
    setInterval(runCheckTwitch, config.twitch.pollMs);
  }
  if (config.youtube.apiKey) {
    setInterval(runCheckYouTube, config.youtube.pollMs);
  }
  if (config.instagram.userId && config.instagram.accessToken) {
    setInterval(runCheckInstagram, config.instagram.pollMs);
  }
  if (config.x.userId && config.x.bearerToken) {
    setInterval(runCheckX, config.x.pollMs);
  }
  if (config.tiktok.rssUrl) {
    setInterval(runCheckTikTok, config.tiktok.pollMs);
  }
}

async function runCheck() {
  await runCheckTwitch();
  await runCheckYouTube();
  await runCheckInstagram();
  await runCheckX();
  await runCheckTikTok();
}

async function sendEmbed(payload) {
  if (!payload) return;
  try {
    const channel = await client.channels.fetch(config.channelId);
    const embed = new EmbedBuilder()
      .setTitle(formatTitle(payload))
      .setURL(payload.url)
      .setTimestamp(new Date())
      .setDescription(extraDesc(payload));

    if (payload.thumbnail) embed.setImage(payload.thumbnail);

    embed.setFooter({ text: footerForType(payload.type) });
    await channel.send({ embeds: [embed] });
  } catch (e) {
    console.error('Failed to send embed:', e.message);
  }
}

function formatTitle(p) {
  switch (p.type) {
    case 'twitch_live': return `🔴 LIVE: ${p.title}`;
    case 'youtube_upload': return `📺 New YouTube video: ${p.title}`;
    case 'instagram_post': return `📸 New Instagram post`;
    case 'x_post': return `𝕏 New post on X`;
    case 'tiktok_post': return `🎵 New TikTok`;
    default: return p.title || 'Update';
  }
}

function extraDesc(p) {
  switch (p.type) {
    case 'twitch_live':
      return `Game: **${p.game || 'Unknown'}**
Started: <t:${Math.floor(new Date(p.startedAt).getTime()/1000)}:R>
👉 ${p.url}`;
    case 'youtube_upload':
      return `Published: <t:${Math.floor(new Date(p.publishedAt).getTime()/1000)}:R>
👉 ${p.url}`;
    case 'instagram_post':
      return `👉 ${p.url}`;
    case 'x_post':
      return `👉 ${p.url}`;
    case 'tiktok_post':
      return `👉 ${p.url}`;
    default:
      return p.url || '';
  }
}

function footerForType(type) {
  if (type?.includes('twitch')) return 'Twitch • rosoesports';
  if (type?.includes('youtube')) return 'YouTube • @RosoEsports';
  if (type?.includes('instagram')) return 'Instagram • @roso.esports';
  if (type?.includes('x_')) return 'X • @rosoideaegg';
  if (type?.includes('tiktok')) return 'TikTok • @rosoesports';
  return 'ROSO Socials';
}

// Individual check runners with error isolation
async function runCheckTwitch() { try { await sendEmbed(await checkTwitchLive()); } catch (e) { console.error('Twitch check failed:', e.message);} }
async function runCheckYouTube() { try { await sendEmbed(await checkYouTubeUpload()); } catch (e) { console.error('YouTube check failed:', e.message);} }
async function runCheckInstagram() { try { await sendEmbed(await checkInstagramPost()); } catch (e) { /* optional */ } }
async function runCheckX() { try { await sendEmbed(await checkXPost()); } catch (e) { /* optional */ } }
async function runCheckTikTok() { try { await sendEmbed(await checkTikTokPost()); } catch (e) { /* optional */ } }

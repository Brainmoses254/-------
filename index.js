// inbox.js
// Handles incoming WhatsApp messages. Customize triggers here.
//
// Example behavior implemented:
//  - If user sends "ping", reply "pong".
//  - If user sends "!song", the bot will attempt to send the server-hosted song (public/assets/song.mp3).
//  - If user sends "!pair", bot will reply with a fresh pairing token URL (uses the server API).
//
// CAUTIONS:
//  - Ensure you legally own the song you send or have permission to distribute it.

const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');

async function handleMessage(client, message) {
  const body = (message.body || '').trim();
  const from = message.from; // e.g., "15551234567@c.us"

  // simple commands
  if (!body) return;

  if (body.toLowerCase() === 'ping') {
    await client.sendMessage(from, 'pong');
    return;
  }

  if (body === '!song') {
    // send the song file if present
    const songPath = path.join(__dirname, 'public', 'assets', 'song.mp3');
    if (fs.existsSync(songPath)) {
      const media = MessageMedia.fromFilePath(songPath);
      await client.sendMessage(from, media, { sendAudioAsVoice: false });
    } else {
      await client.sendMessage(from, 'Sorry — no song is uploaded on the server. Put your file at public/assets/song.mp3');
    }
    return;
  }

  if (body === '!pair') {
    // request server API to get a token (assumes server is reachable)
    try {
      const res = await fetch(`${process.env.SELF_URL || 'http://localhost:3000'}/api/pair`, { method: 'POST' });
      const json = await res.json();
      if (json.url) {
        await client.sendMessage(from, `Pairing session created: ${json.url}\nExpires in a short time.`);
      } else {
        await client.sendMessage(from, 'Could not create pairing session.');
      }
    } catch (err) {
      await client.sendMessage(from, 'Failed to create pairing session: ' + err.message);
    }
    return;
  }

  // default echo (for debugging)
  if (body.length < 512) {
    await client.sendMessage(from, `You said: "${body}"`);
  } else {
    // ignore very long messages
  }
}

module.exports = { handleMessage };
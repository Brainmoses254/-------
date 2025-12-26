// headme.js
// Entry point for the WhatsApp bot + pairing-site server.
// Usage:
//  1. Place your background image and song in ./public/assets/
//     - background: public/assets/background.jpg (or update pair.html to use a URL)
//     - song: public/assets/song.mp3
//  2. npm install
//  3. npm start
//
// Notes:
//  - This uses whatsapp-web.js (puppeteer) to run a WhatsApp session. Scan the QR shown in console to authenticate.
//  - Session is persisted to ./session/session.json so you don't need to scan each run.

const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const inbox = require('./inbox'); // message handler module

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static site
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Simple API: generate a pairing code (cryptographically random)
app.post('/api/pair', (req, res) => {
  const bytes = require('crypto').randomBytes(24);
  const token = bytes.toString('base64url'); // safe in URLs
  res.json({ token, url: `${req.protocol}://${req.get('host')}/#/s/${token}` });
});

// Endpoint to trigger sending the uploaded song to a chat (owner-only, you must set OWNER_NUMBER env var)
app.post('/api/send-song', async (req, res) => {
  try {
    const owner = process.env.OWNER_NUMBER; // e.g. "15551234567@c.us"
    if (!owner) return res.status(400).json({ error: 'OWNER_NUMBER not configured' });
    const songPath = path.join(__dirname, 'public', 'assets', 'song.mp3');
    if (!fs.existsSync(songPath)) return res.status(404).json({ error: 'song not found on server' });
    const media = MessageMedia.fromFilePath(songPath);
    await client.sendMessage(owner, media, { sendAudioAsVoice: false });
    res.json({ ok: true });
  } catch (e) {
    console.error('send-song error', e);
    res.status(500).json({ error: e.message });
  }
});

// Serve a small health-check
app.get('/healthz', (req, res) => res.send('ok'));

// Setup WhatsApp client with LocalAuth so session is persisted automatically
const client = new Client({
  authStrategy: new LocalAuth({ clientId: "default" }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  console.log('QR RECEIVED — scan with WhatsApp:');
  qrcode.generate(qr, { small: true });
  io.emit('whatsapp:qr', { qr });
});

client.on('ready', () => {
  console.log('WhatsApp client ready.');
  io.emit('whatsapp:ready', { ready: true });
});

client.on('auth_failure', (msg) => {
  console.error('AUTH FAILURE', msg);
  io.emit('whatsapp:auth_failure', { msg });
});

client.on('disconnected', (reason) => {
  console.log('Client disconnected:', reason);
  io.emit('whatsapp:disconnected', { reason });
});

// Delegate incoming messages to inbox module
client.on('message', async (message) => {
  try {
    await inbox.handleMessage(client, message);
    io.emit('whatsapp:message', {
      from: message.from,
      body: message.body || '',
      hasMedia: message.hasMedia || false,
      timestamp: message.timestamp
    });
  } catch (err) {
    console.error('Error in message handler', err);
  }
});

client.initialize();

// Socket.io connections for realtime status and pairing UI integration
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('generatePair', () => {
    const token = require('crypto').randomBytes(24).toString('base64url');
    socket.emit('pairGenerated', { token, url: `${socket.handshake.headers.origin}/#/s/${token}` });
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
# WhatsApp Pairing Bot — virus

This repository contains:
- A WhatsApp bot (whatsapp-web.js) that can reply to messages and send your uploaded song.
- A static pairing site (pair.html) with a background image and an audio player.
- Dockerfile, heroku manifest, and app.json for deploying.

Important: You must provide your own image and song.
- Background image: put at public/assets/background.jpg (or edit public/pair.css to use a remote URL).
- Song audio: put at public/assets/song.mp3

Quick start (local)
1. Clone repo locally.
2. Place your image and song:
   - mkdir -p public/assets
   - curl -o public/assets/background.jpg "https://files.catbox.moe/tihrtk.jpg"   # or upload your own
   - cp /path/to/your-song.mp3 public/assets/song.mp3
3. Install:
   - npm install
4. Start:
   - npm start
5. In the server console you'll see a QR when starting the WhatsApp client. Scan it with WhatsApp (Settings → Linked Devices → Link a Device).
6. Open http://localhost:3000/pair.html to use the pairing page.

Deploy suggestions
- Heroku (classic Node): push to GitHub and deploy from a repo; set SELF_URL and OWNER_NUMBER env vars in Heroku settings.
- Heroku Container (heroku.yml): build the Docker container and deploy.
- Railway / Render / VPS: ensure the host allows headless Chrome and set environment variables.

Security & legal
- Do not share the uploaded song unless you have distribution rights.
- WhatsApp automation may violate WhatsApp's terms of service — use responsibly and at your own risk.

Customizations I can help with
- Replace the background image with an external URL or a CDN link.
- Add a hosted repo and push files to GitHub for you (I can provide exact git commands and a repo name suggestion).
- Add QR display UI in the web page (currently QR is printed in server console).
- Add persistent session handling and web UI for message logs.

Author: virus (Brainmoses254)
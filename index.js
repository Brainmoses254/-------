{
  "name": "whatsapp-pair-bot",
  "description": "WhatsApp pairing bot and static pairing site (Node.js). Background image & song are used from /public/assets.",
  "repository": "https://github.com/YOUR_USERNAME/whatsapp-pair-bot",
  "logo": "https://files.catbox.moe/tihrtk.jpg",
  "keywords": ["whatsapp", "bot", "pairing", "nodejs"],
  "env": {
    "OWNER_NUMBER": {
      "description": "Owner phone number like 15551234567@c.us (optional)",
      "value": ""
    },
    "SELF_URL": {
      "description": "Public URL where this app is hosted (used to produce share links). Set after deploy.",
      "value": ""
    }
  },
  "buildpacks": [
    { "url": "heroku/nodejs" }
  ],
  "formation": { "web": { "quantity": 1 } }
}
import express from "express";
import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load config
const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
const gemini = new GoogleGenAI({ apiKey: config.geminiKey });

// Express app
const app = express();
app.use(express.json());

// Load commands dynamically
const commands = new Map();
const cmdPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(cmdPath).filter(f => f.endsWith(".js"));
for (const file of commandFiles) {
  const cmd = await import(`./commands/${file}`);
  commands.set(cmd.default.name.toLowerCase(), cmd.default);
  console.log(`✅ Loaded command: ${cmd.default.name}`);
}

// Economy system
const ecoFile = path.join(__dirname, "economy.json");
let eco = {};
if (fs.existsSync(ecoFile)) eco = JSON.parse(fs.readFileSync(ecoFile, "utf8"));

function saveEco() {
  fs.writeFileSync(ecoFile, JSON.stringify(eco, null, 2));
}

function getUser(id) {
  if (!eco[id]) eco[id] = { coins: 100, role: 1, lastCmd: 0 };
  return eco[id];
}

// Facebook verification webhook
app.get("/webhook", (req, res) => {
  if (req.query["hub.verify_token"] === config.verifyToken) {
    res.send(req.query["hub.challenge"]);
  } else {
    res.send("Invalid verify token");
  }
});

// Handle incoming messages
app.post("/webhook", async (req, res) => {
  const entry = req.body.entry?.[0];
  const event = entry?.messaging?.[0];
  if (!event?.message?.text) return res.sendStatus(200);

  const sender = event.sender.id;
  const msg = event.message.text.trim();
  const args = msg.split(" ");
  const cmdName = args[0].toLowerCase();
  const cmd = commands.get(cmdName);
  const user = getUser(sender);

  if (!cmd) return res.sendStatus(200);

  // Role check
  if (user.role < (cmd.role || 0)) {
    await sendMsg(sender, "❌ You do not have permission to use this command.");
    return res.sendStatus(200);
  }

  // Cooldown check
  const now = Date.now();
  if (cmd.cooldown && now - user.lastCmd < cmd.cooldown * 1000) {
    const remaining = ((cmd.cooldown * 1000 - (now - user.lastCmd)) / 1000).toFixed(1);
    await sendMsg(sender, `⏳ Please wait ${remaining}s before using that command again.`);
    return res.sendStatus(200);
  }
  user.lastCmd = now;

  try {
    await cmd.execute({
      sender,
      args,
      sendMsg,
      eco,
      saveEco,
      user,
      config,
      gemini,
      commands
    });
  } catch (err) {
    console.error(err);
    await sendMsg(sender, "⚠️ Error executing command.");
  }

  saveEco();
  res.sendStatus(200);
});

// Helper to send message to Facebook user
async function sendMsg(id, text) {
  try {
    await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${config.pageToken}`, {
      recipient: { id },
      message: { text }
    });
  } catch (err) {
    console.error("❌ Send error:", err.response?.data || err.message);
  }
}

// Root route for Render health check
app.get("/", (_, res) => res.send("✅ Facebook Bot is running!"));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Bot running on port ${PORT}`));
    

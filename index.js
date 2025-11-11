import express from "express";
import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { GoogleGenerativeAI } from "google-generative-ai";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = JSON.parse(fs.readFileSync("./config.json"));
const genAI = new GoogleGenerativeAI(config.geminiKey);

const app = express();
app.use(express.json());

// Load commands
const commands = new Map();
const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));
for (const file of commandFiles) {
  const cmd = await import(`./commands/${file}`);
  commands.set(cmd.default.name.toLowerCase(), cmd.default);
}

// Economy system
const ecoFile = "./economy.json";
let eco = JSON.parse(fs.readFileSync(ecoFile));

function saveEco() {
  fs.writeFileSync(ecoFile, JSON.stringify(eco, null, 2));
}

function getUser(id) {
  if (!eco[id]) eco[id] = { coins: 100, role: 1 };
  return eco[id];
}

// Facebook webhook setup
app.get("/webhook", (req, res) => {
  if (req.query["hub.verify_token"] === config.verifyToken) {
    res.send(req.query["hub.challenge"]);
  } else {
    res.send("Invalid verify token");
  }
});

// Handle messages
app.post("/webhook", async (req, res) => {
  const entry = req.body.entry?.[0];
  const event = entry?.messaging?.[0];
  if (!event?.message?.text) return res.sendStatus(200);

  const sender = event.sender.id;
  const message = event.message.text.trim();
  const user = getUser(sender);

  const args = message.split(" ");
  const cmdName = args[0].toLowerCase();

  const cmd = commands.get(cmdName);
  if (!cmd) return res.sendStatus(200);

  // Cooldown check (optional)
  if (cmd.cooldown && user.lastCmd && Date.now() - user.lastCmd < cmd.cooldown * 1000) {
    return sendMsg(sender, `⏳ Wait ${cmd.cooldown}s before reusing that command.`);
  }
  user.lastCmd = Date.now();

  try {
    await cmd.execute({ sender, args, sendMsg, eco, saveEco, user, config, genAI, commands });
  } catch (err) {
    console.error(err);
    await sendMsg(sender, "⚠️ Command error.");
  }
  saveEco();
  res.sendStatus(200);
});

async function sendMsg(id, text) {
  await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${config.pageToken}`, {
    recipient: { id },
    message: { text }
  });
}

app.get("/", (_, res) => res.send("✅ Facebook Bot Running"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot running on port ${PORT}`));

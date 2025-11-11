import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load config and economy
import config from "./config.json" assert { type: "json" };
import eco from "./economy.json" assert { type: "json" };

const app = express();
app.use(bodyParser.json());

// ✅ Dynamic command loader
const commands = new Map();
const commandFolder = path.join(__dirname, "commands");
for (const file of fs.readdirSync(commandFolder)) {
  if (file.endsWith(".js")) {
    const command = await import(`./commands/${file}`);
    commands.set(command.default.name, command.default);
  }
}

const PORT = process.env.PORT || 3000;

// ✅ Helper: save economy file
function saveEco() {
  fs.writeFileSync("./economy.json", JSON.stringify(eco, null, 2));
}

// ✅ Helper: send message
async function sendMsg(id, text) {
  if (!id || typeof id !== "string" || !/^[0-9]+$/.test(id)) {
    console.warn("⚠️ Invalid recipient ID:", id);
    return;
  }
  try {
    await axios.post(
      `https://graph.facebook.com/v17.0/me/messages?access_token=${config.pageToken}`,
      {
        recipient: { id },
        message: { text },
      }
    );
  } catch (err) {
    console.error("❌ Send error:", err.response?.data || err.message);
  }
}

// ✅ Webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === config.verifyToken) {
    console.log("✅ Webhook verified!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ✅ Webhook receiver
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry) {
      const event = entry.messaging?.[0] || entry.standby?.[0];
      if (!event) continue;

      const sender = event.sender?.id;
      const message = event.message?.text;

      console.log("🛰️ Incoming event:", JSON.stringify(event, null, 2));
      console.log("👤 Sender ID:", sender);

      if (!sender || !message) continue;

      // Create account if missing
      if (!eco[sender]) {
        eco[sender] = { coins: 100, role: 1 };
        saveEco();
      }

      const args = message.trim().split(/\s+/);
      const cmdName = args.shift().toLowerCase();

      const cmd =
        commands.get(cmdName) ||
        [...commands.values()].find((c) => c.aliases?.includes(cmdName));

      if (cmd) {
        try {
          await cmd.run({
            sendMsg,
            sender,
            args,
            eco,
            saveEco,
            config,
            commands,
          });
        } catch (err) {
          console.error("❌ Command error:", err);
          await sendMsg(sender, "❌ An error occurred while running that command.");
        }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => console.log(`✅ Bot running on port ${PORT}`));

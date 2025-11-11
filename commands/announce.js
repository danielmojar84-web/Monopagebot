export default {
  name: "announce",
  description: "Send a broadcast message to all users (Admin only)",
  usage: "announce <message>",
  role: 2,
  cooldown: 10,
  author: "Dandevs",
  async execute({ sender, args, eco, sendMsg, user }) {
    if (user.role < 2) return sendMsg(sender, "❌ You are not an admin.");

    const message = args.slice(1).join(" ");
    if (!message) return sendMsg(sender, "❌ Usage: announce <message>");

    sendMsg(sender, `📢 Sending announcement to ${Object.keys(eco).length} users...`);

    let count = 0;
    for (const id of Object.keys(eco)) {
      try {
        await sendMsg(id, `📣 **Announcement from Admin**:\n${message}`);
        count++;
      } catch (err) {
        console.error(`Failed to send to ${id}:`, err.response?.data || err.message);
      }
      await new Promise(r => setTimeout(r, 500)); // prevent rate limit
    }

    sendMsg(sender, `✅ Announcement sent to ${count} users.`);
  }
};
    

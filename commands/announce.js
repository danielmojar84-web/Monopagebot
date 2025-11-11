export default {
  name: "announce",
  role: 2, // Admin only
  author: "GPT-5",
  description: "Announce a message to all users",
  cooldown: 10,
  usage: "announce <message>",

  async run({ sendMsg, sender, args, eco }) {
    const msg = args.join(" ");
    if (!msg) return sendMsg(sender, "⚠️ Usage: announce <message>");
    if (!eco[sender] || eco[sender].role !== 2)
      return sendMsg(sender, "❌ You are not an admin.");

    let sentCount = 0;
    const users = Object.keys(eco).filter((id) => /^[0-9]+$/.test(id));

    for (const id of users) {
      await sendMsg(id, `📢 Announcement:\n${msg}`);
      sentCount++;
      await new Promise((r) => setTimeout(r, 200)); // Prevent spam
    }

    await sendMsg(sender, `✅ Announcement sent to ${sentCount} users.`);
  },
};
        

export default {
  name: "admin",
  description: "Add or remove admin roles",
  usage: "admin <add|remove> <id>",
  role: 2,
  cooldown: 3,
  author: "Dandevs",
  async execute({ args, eco, saveEco, sendMsg, user }) {
    if (user.role < 2) return sendMsg(args[0], "❌ You’re not admin.");
    const action = args[1];
    const id = args[2];
    if (!action || !id) return sendMsg(args[0], "Usage: admin <add|remove> <id>");

    if (!eco[id]) eco[id] = { coins: 100, role: 1 };
    if (action === "add") eco[id].role = 2;
    else if (action === "remove") eco[id].role = 1;
    else return sendMsg(args[0], "❌ Invalid action.");

    saveEco();
    sendMsg(args[0], `✅ ${action}ed admin for ${id}`);
  }
};

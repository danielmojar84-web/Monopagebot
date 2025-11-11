export default {
  name: "accessadmin",
  description: "Get admin access using secret code",
  usage: "accessadmin <code>",
  role: 0,
  cooldown: 3,
  author: "System",
  async execute({ sender, args, eco, saveEco, sendMsg, config }) {
    if (args[1] === config.adminCode) {
      eco[sender].role = 2;
      saveEco();
      sendMsg(sender, "✅ You are now an admin!");
    } else {
      sendMsg(sender, "❌ Invalid access code.");
    }
  }
};

export default {
  name: "setcoin",
  description: "Set any user's coin amount (Admin only)",
  usage: "setcoin <id> <amount>",
  role: 2,
  cooldown: 3,
  author: "Dandevs",
  async execute({ sender, args, eco, sendMsg, saveEco, user }) {
    if (user.role < 2) return sendMsg(sender, "❌ You are not an admin.");
    const id = args[1];
    const amount = parseInt(args[2]);

    if (!id || isNaN(amount)) return sendMsg(sender, "❌ Usage: setcoin <id> <amount>");
    if (!eco[id]) eco[id] = { coins: 100, role: 1 };

    eco[id].coins = amount;
    saveEco();
    sendMsg(sender, `✅ Set ${id}'s coins to ${amount}.`);
  }
};

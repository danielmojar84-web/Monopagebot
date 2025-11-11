export default {
  name: "gift",
  description: "Send coins to another user",
  usage: "gift <id> <amount>",
  role: 0,
  cooldown: 3,
  author: "System",
  async execute({ sender, args, eco, sendMsg, saveEco }) {
    const id = args[1];
    const amount = parseInt(args[2]);
    const user = eco[sender];

    if (!id || !amount || amount <= 0) return sendMsg(sender, "❌ Usage: gift <id> <amount>");
    if (!eco[id]) eco[id] = { coins: 100, role: 1 };
    if (user.coins < amount) return sendMsg(sender, "❌ Not enough coins.");

    eco[id].coins += amount;
    user.coins -= amount;

    saveEco();
    sendMsg(sender, `🎁 You gifted ${amount} coins to ${id}! 💰 Your balance: ${user.coins}`);
  }
};

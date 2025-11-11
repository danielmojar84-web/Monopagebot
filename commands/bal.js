export default {
  name: "bal",
  description: "Check your coin balance",
  usage: "bal",
  role: 0,
  cooldown: 2,
  author: "System",
  async execute({ sender, eco, sendMsg }) {
    const user = eco[sender];
    sendMsg(sender, `💰 Your balance: ${user.coins} coins`);
  }
};

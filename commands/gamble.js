export default {
  name: "gamble",
  description: "50/50 coin flip gamble",
  usage: "gamble <bet>",
  role: 0,
  cooldown: 5,
  author: "System",
  async execute({ sender, args, eco, sendMsg, saveEco }) {
    const user = eco[sender];
    const bet = parseInt(args[1]);

    if (!bet || bet <= 0) return sendMsg(sender, "❌ Enter a valid bet amount.");
    if (user.coins < bet) return sendMsg(sender, "❌ Not enough coins.");

    const win = Math.random() < 0.5;
    if (win) {
      user.coins += bet;
      sendMsg(sender, `🎉 You won ${bet} coins! 💰 New balance: ${user.coins}`);
    } else {
      user.coins -= bet;
      sendMsg(sender, `😢 You lost ${bet} coins. 💰 New balance: ${user.coins}`);
    }

    saveEco();
  }
};

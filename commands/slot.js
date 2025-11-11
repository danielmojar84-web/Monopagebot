export default {
  name: "slot",
  description: "Play a slot machine to win or lose coins",
  usage: "slot <bet>",
  role: 0,
  cooldown: 5,
  author: "System",
  async execute({ sender, args, eco, sendMsg, saveEco }) {
    const user = eco[sender];
    const bet = parseInt(args[1]);

    if (!bet || bet <= 0) return sendMsg(sender, "❌ Enter a valid bet amount.");
    if (user.coins < bet) return sendMsg(sender, "❌ Not enough coins.");

    const items = ["🍒", "🍋", "🍇", "💎", "7️⃣"];
    const r = () => items[Math.floor(Math.random() * items.length)];
    const slot = [r(), r(), r()];

    let result = "😢 You lost!";
    if (slot[0] === slot[1] && slot[1] === slot[2]) {
      const win = bet * 3;
      user.coins += win;
      result = `🎉 JACKPOT! You won ${win} coins!`;
    } else if (slot[0] === slot[1] || slot[1] === slot[2] || slot[0] === slot[2]) {
      const win = bet * 1.5;
      user.coins += Math.floor(win);
      result = `😄 You won ${Math.floor(win)} coins!`;
    } else {
      user.coins -= bet;
    }

    saveEco();
    sendMsg(sender, `🎰 | ${slot.join(" | ")}\n${result}\n💰 Balance: ${user.coins}`);
  }
};

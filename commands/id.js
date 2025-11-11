export default {
  name: "id",
  description: "Show your user ID",
  usage: "id",
  role: 0,
  cooldown: 2,
  author: "System",
  async execute({ sender, sendMsg }) {
    sendMsg(sender, `🆔 Your ID: ${sender}`);
  }
};

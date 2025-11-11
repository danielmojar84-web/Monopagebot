export default {
  name: "help",
  description: "Show commands list or command info",
  usage: "help <page | command>",
  role: 0,
  cooldown: 2,
  author: "System",
  async execute({ args, sendMsg, commands }) {
    if (!args[1]) args[1] = "1";
    const arg = args[1].toLowerCase();

    if (isNaN(arg)) {
      const cmd = commands.get(arg);
      if (!cmd) return sendMsg(args[0], "❌ Command not found.");
      return sendMsg(args[0], 
        `📘 ${cmd.name}\nDescription: ${cmd.description}\nUsage: ${cmd.usage}\nRole: ${cmd.role}\nCooldown: ${cmd.cooldown}s\nAuthor: ${cmd.author}`
      );
    }

    const page = parseInt(arg);
    const cmds = Array.from(commands.values());
    const maxPage = Math.ceil(cmds.length / 5);
    if (page > maxPage) return sendMsg(args[0], `❌ Only ${maxPage} pages.`);

    const list = cmds.slice((page - 1) * 5, page * 5)
      .map(c => `• ${c.name} — ${c.description}`)
      .join("\n");

    sendMsg(args[0], `📖 Commands (Page ${page}/${maxPage})\n\n${list}`);
  }
};

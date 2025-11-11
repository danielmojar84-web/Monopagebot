export default {
  name: "gemini",
  description: "Ask Gemini AI a question",
  usage: "gemini <question>",
  role: 0,
  cooldown: 5,
  author: "Dandevs",
  async execute({ args, sendMsg, genAI }) {
    const prompt = args.slice(1).join(" ");
    if (!prompt) return sendMsg(args[0], "❌ Enter a question.");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    sendMsg(args[0], result.response.text());
  }
};

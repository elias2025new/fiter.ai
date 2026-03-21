import { Bot, Context } from "grammy";
import { supabase } from "../utils/supabase";

/**
 * Custom context type for our bot
 */
type MyContext = Context;

// Create the bot instance
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not defined");

export const bot = new Bot<MyContext>(token);

// The URL of your hosted Mini App (e.g., on Vercel)
// We'll use the environment variable if available, otherwise fallback to the webhook host if we can detect it
const APP_URL = process.env.APP_URL || "https://fiter-ai.vercel.app";

// Handle /start command
bot.command("start", async (ctx) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  // 1. Check if user is already registered
  const { data: existingStudent } = await supabase
    .from("students")
    .select("id")
    .eq("telegram_id", telegramId)
    .single();

  if (existingStudent) {
    await ctx.reply("Welcome back to Fiter.ai! 🚀 You're already registered. Stay tuned for more updates!", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Open Fiter.ai", web_app: { url: APP_URL } }]
        ]
      }
    });
    return;
  }

  // 2. Welcome message with Mini App button
  await ctx.reply(
    "Welcome to Fiter.ai! 🚀 Ready to learn how to build real-world software and websites using AI?\n\nClick the button below to register and join our elite cohort.",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Register Now ⚡",
              web_app: { url: APP_URL },
            },
          ],
        ],
      },
    }
  );
});

// Default response for other messages
bot.on("message", async (ctx) => {
  await ctx.reply("Ready to start your AI journey? Send /start to register!", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Open Fiter.ai", web_app: { url: APP_URL } }]
      ]
    }
  });
});

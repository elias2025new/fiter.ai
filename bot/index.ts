import { Bot, Context, session } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";
import { supabase } from "../utils/supabase";

/**
 * Custom context type for our bot
 */
type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

// Create the bot instance
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not defined");

export const bot = new Bot<MyContext>(token);

// Install session middleware
bot.use(
  session({
    initial: () => ({}),
  })
);

// Install conversations plugin
bot.use(conversations());

/**
 * Registration conversation flow
 */
async function register(conversation: MyConversation, ctx: MyContext) {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  // 1. Check if user is already registered
  const { data: existingStudent, error: checkError } = await conversation.external(() =>
    supabase
      .from("students")
      .select("id")
      .eq("telegram_id", telegramId)
      .single()
  );

  if (existingStudent) {
    await ctx.reply("You are already registered for Fiter.ai! Stay tuned for updates.");
    return;
  }

  // 2. Welcome message
  await ctx.reply(
    "Welcome to Fiter.ai! 🚀 Ready to learn how to build real-world software and websites using AI? Let's get you registered."
  );

  // 3. Ask for Full Name
  await ctx.reply("Please enter your Full Name:");
  const nameCtx = await conversation.waitFor(":text");
  const fullName = nameCtx.msg.text;

  // 4. Ask for Email Address
  let email = "";
  let isValidEmail = false;
  while (!isValidEmail) {
    await ctx.reply("Please enter your Email Address:");
    const emailCtx = await conversation.waitFor(":text");
    email = emailCtx.msg.text;

    // Simple email validation regex
    isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      await ctx.reply("That doesn't look like a valid email. Please try again.");
    }
  }

  // 5. Ask for Experience Level
  await ctx.reply("What is your current AI/Software development experience level?", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Beginner", callback_data: "Beginner" }],
        [{ text: "Intermediate", callback_data: "Intermediate" }],
        [{ text: "Advanced", callback_data: "Advanced" }],
      ],
    },
  });

  const levelCtx = await conversation.waitForCallbackQuery(["Beginner", "Intermediate", "Advanced"]);
  const experienceLevel = levelCtx.callbackQuery.data;
  await levelCtx.answerCallbackQuery();

  // 6. Save to Supabase
  const { error: insertError } = await conversation.external(() =>
    supabase.from("students").insert([
      {
        telegram_id: telegramId,
        username: ctx.from?.username || null,
        full_name: fullName,
        email: email,
        experience_level: experienceLevel,
      },
    ])
  );

  if (insertError) {
    console.error("Supabase Insertion Error:", insertError);
    await ctx.reply(
      "Sorry, there was an error saving your registration. Please try again later using /start."
    );
    return;
  }

  // 7. Success message
  await ctx.reply(
    `🎉 Registration complete, ${fullName}! Welcome to Fiter.ai. We will reach out to your email (${email}) with the next steps soon!`
  );
}

// Register the conversation
bot.use(createConversation(register));

// Handle /start command
bot.command("start", async (ctx) => {
  await ctx.conversation.enter("register");
});

// Default response for other messages
bot.on("message", async (ctx) => {
  await ctx.reply("Send /start to begin your registration for Fiter.ai!");
});

# Fiter.ai Telegram Bot

A registration bot for students wanting to learn AI tools, built with grammY, Supabase, and Vercel.

## 🚀 Setup Instructions

### 1. Supabase Setup
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the SQL Editor and run the contents of `supabase_schema.sql` to create the `students` table.
3. Obtain your `Project URL` and `service_role` API key from **Project Settings > API**.

### 2. Telegram Bot Setup
1. Message [@BotFather](https://t.me/botfather) on Telegram to create a new bot.
2. Save the API Token provided.

### 3. Environment Variables
1. Create a `.env` file based on `.env.example`:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

### 4. Deployment to Vercel
1. Install the Vercel CLI: `npm i -g vercel`.
2. Run `vercel` in the root directory to deploy.
3. Add the environment variables to your Vercel project settings.

### 5. Set Webhook
Replace `<VAR>` with your actual values and run this command:
```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://<YOUR_VERCEL_DOMAIN>/api/webhook"
```

## 🛠 Tech Stack
- **grammY**: Telegram Bot Framework.
- **Supabase**: Database and Auth.
- **Vercel**: Serverless Hosting.
- **TypeScript**: Typed JavaScript.

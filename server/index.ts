import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { bot } from './bot/index';
import { webhookCallback } from 'grammy';
import { supabase } from './utils/supabase';
import crypto from 'crypto';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- Telegram Webhook ---
// Note: In production, this should be a protected secret URL
app.post('/api/webhook', webhookCallback(bot, 'express'));

// --- Registration API ---
app.post('/api/register', async (req: Request, res: Response) => {
  const { fullName, email, phone_number, experience_level, initData } = req.body;

  if (!fullName || !email || !phone_number || !experience_level || !initData) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // 1. Validate Init Data (Security)
  const isValid = validateInitData(initData, botToken);
  if (!isValid && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Invalid authentication data' });
  }

  // 2. Extract User Info from Init Data
  const urlParams = new URLSearchParams(initData);
  const userString = urlParams.get('user');
  if (!userString) {
    return res.status(400).json({ error: 'User data missing in initData' });
  }

  const user = JSON.parse(userString);
  const telegramId = user.id;
  const username = user.username || null;

  try {
    // 3. Save to Supabase
    const { data, error } = await supabase
      .from('students')
      .upsert([
        {
          telegram_id: telegramId,
          username: username,
          full_name: fullName,
          email: email,
          phone_number: phone_number,
          experience_level: experience_level,
        },
      ], { onConflict: 'telegram_id' });

    if (error) {
      console.error('Supabase Error:', error);
      return res.status(500).json({ error: 'Failed to save registration' });
    }

    return res.status(200).json({ message: 'Registration successful', data });
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Validates the initData from Telegram Mini App
 */
function validateInitData(initData: string, botToken: string): boolean {
  if (!initData) return false;
  
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  
  const dataCheckString = Array.from(urlParams.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
    
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
    
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
    
  return calculatedHash === hash;
}

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;

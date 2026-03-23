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

// --- Check Registration Status ---
app.get('/api/check', async (req: Request, res: Response) => {
  const telegramId = req.query.telegram_id as string;
  if (!telegramId) return res.status(400).json({ error: 'Missing telegram_id' });

  try {
    const { data, error } = await supabase
      .from('students')
      .select('id')
      .eq('telegram_id', telegramId)
      .maybeSingle();

    if (error) return res.status(500).json({ error: 'Database error' });
    return res.status(200).json({ registered: !!data });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

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

// --- Admin API ---
const ADMIN_TELEGRAM_ID = 5908397596;

app.get('/api/admin', async (req: Request, res: Response) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return res.status(500).json({ error: 'Server configuration error' });

  const initData = req.headers['x-init-data'] as string;
  if (!initData) return res.status(401).json({ error: 'Unauthorized' });

  const urlParams = new URLSearchParams(initData);
  const userString = urlParams.get('user');
  let userId: number | null = null;

  if (userString) {
    try { userId = JSON.parse(userString).id; } catch {}
  }

  const isValid = validateInitData(initData, botToken);
  if ((!isValid || userId !== ADMIN_TELEGRAM_ID) && process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const { data, error } = await supabase
      .from('students')
      .select('id, telegram_id, username, full_name, email, phone_number, experience_level, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Error:', error);
      return res.status(500).json({ error: 'Failed to fetch registrations' });
    }

    return res.status(200).json({ students: data });
  } catch (err) {
    console.error('Admin Error:', err);
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

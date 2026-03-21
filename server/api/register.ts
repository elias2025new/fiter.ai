import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../utils/supabase';
import crypto from 'crypto';

/**
 * Validates the initData from Telegram Mini App
 * This ensures the request is coming from a legitimate Telegram user
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fullName, email, experience_level, initData } = req.body;

  if (!fullName || !email || !experience_level || !initData) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // 1. Validate Init Data (Security)
  // Note: For development, you might want to skip this if you're not using a real token.
  // But for production, it's CRITICAL.
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
}

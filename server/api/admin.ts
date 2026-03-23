import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../utils/supabase';
import crypto from 'crypto';

const ADMIN_TELEGRAM_ID = 5908397596;

function validateInitData(initData: string, botToken: string): { valid: boolean; userId?: number } {
  if (!initData) return { valid: false };

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

  if (calculatedHash !== hash) return { valid: false };

  const userString = urlParams.get('user');
  if (!userString) return { valid: false };

  const user = JSON.parse(userString);
  return { valid: true, userId: user.id };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const initData = req.headers['x-init-data'] as string;
  if (!initData) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { valid, userId } = validateInitData(initData, botToken);

  if (!valid && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Invalid authentication data' });
  }

  if (userId !== ADMIN_TELEGRAM_ID && process.env.NODE_ENV === 'production') {
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
}

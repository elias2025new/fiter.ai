import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../utils/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const telegramId = req.query.telegram_id as string;
  if (!telegramId) {
    return res.status(400).json({ error: 'Missing telegram_id' });
  }

  try {
    const { data, error } = await supabase
      .from('students')
      .select('id')
      .eq('telegram_id', telegramId)
      .maybeSingle();

    if (error) {
      console.error('Supabase Error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    return res.status(200).json({ registered: !!data });
  } catch (err) {
    console.error('Check Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

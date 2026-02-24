import { kv } from '@vercel/kv';

const KEY = 'lixi:leaderboard';
const MAX_ENTRIES = 100;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      let data = await kv.get(KEY) || [];
      data.sort((a, b) => b.amount - a.amount);
      res.status(200).json(data.slice(0, 200));
    } catch (error) {
      console.error(error);
      res.status(500).json([]);
    }
  }

  if (req.method === 'POST') {
    try {
      const newEntry = req.body;
      if (!newEntry || !newEntry.name || !newEntry.amount) {
        return res.status(400).json({ error: 'Thiếu thông tin' });
      }

      let leaderboard = await kv.get(KEY) || [];
      leaderboard.push(newEntry);

      leaderboard.sort((a, b) => b.amount - a.amount);

      if (leaderboard.length > MAX_ENTRIES) {
        leaderboard = leaderboard.slice(0, MAX_ENTRIES);
      }

      await kv.set(KEY, leaderboard);

      res.status(200).json(leaderboard);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Lỗi server' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
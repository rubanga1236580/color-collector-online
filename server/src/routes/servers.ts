import { Router } from 'express';
import { getOnlinePlayerCount } from '../onlinePlayers.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json([
    {
      id: 'server-001',
      name: 'Server 1',
      description: '通常サーバー',
      onlineCount: getOnlinePlayerCount(),
    },
  ]);
});

export default router;
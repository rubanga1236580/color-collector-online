import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json([
    {
      id: 'server-001',
      name: 'Server 1',
      description: '通常サーバー',
    },
  ]);
});

export default router;

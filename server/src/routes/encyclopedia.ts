import { Router } from 'express';
import { COLORS } from '../data/colors.js';
import { getPlayer } from '../database/playerDatabase.js';
import { getPlayerIdFromRequest } from './serverContext.js';

const router = Router();

router.get('/', (req, res) => {
  const playerId = getPlayerIdFromRequest(req);
  const player = getPlayer(playerId);

  if (!player) {
    res.status(500).json({ error: 'プレイヤーデータの取得に失敗しました' });
    return;
  }

  const stocksMap = player.stocks as Record<string, number>;
  const unlockedMap = player.unlocked as Record<string, boolean> | undefined;
  const constellationMap = player.constellation as Record<string, number>;

  const colors = COLORS.map((color) => {
    const owned = unlockedMap?.[color.id] ?? false;
    const stock = stocksMap[color.id] ?? 0;
    const constellation = constellationMap[color.id] ?? 0;

    return {
      id: color.id,
      name: color.code,
      owned,
      stock,
      constellation,
    };
  });

  const collectedCount = colors.filter((color) => color.owned).length;

  res.json({
    colors,
    collectedCount,
    totalCount: COLORS.length,
  });
});

export default router;

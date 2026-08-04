import { getOnlinePlayerCount } from '../onlinePlayers.js';
import { Router } from 'express';
import { randomUUID } from 'crypto';
import { getDatabase } from '../database/db.js';
import {
  savePlayer,
  getPlayersByServerId,
  deleteAllPlayers,
} from '../database/playerDatabase.js';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { COLORS } from '../data/colors.js';
import type { PlayerData } from '../data/player.js';
import { getServerIdFromRequest } from './serverContext.js';

const router = Router();

router.get('/online-count', (_req, res) => {
  res.json({
    onlineCount: getOnlinePlayerCount(),
  });
});

router.get('/', (req, res) => {
  const serverId = getServerIdFromRequest(req);
  const players = getPlayersByServerId(serverId);
  res.json(players);
});

router.post('/', (req, res) => {
  const { name } = req.body as { name?: unknown };
  const trimmedName = typeof name === 'string' ? name.trim() : '';

  if (trimmedName.length < 1 || trimmedName.length > 16) {
    res.status(400).json({ success: false, error: '名前は1〜16文字で入力してください' });
    return;
  }

  const serverId = getServerIdFromRequest(req);
  const id = `player-${serverId}-${randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  const colorIds = COLORS.map((color) => color.id);
  const zeroCounts = Object.fromEntries(colorIds.map((colorId) => [colorId, 0])) as PlayerData['stocks'];
  const falseFlags = Object.fromEntries(colorIds.map((colorId) => [colorId, false])) as NonNullable<PlayerData['unlocked']>;

  const player = {
    id,
    name: trimmedName,
    coins: 100,
    energy: 0,
    energyMax: GAME_CONFIG.ENERGY_MAX ?? 100,
    lastEnergyUpdate: now,
    gachaTicket: 0,
    totalGachaCount: 0,
    totalPaintCount: 0,
    gachaLastClaimDate: '',
    stocks: { ...zeroCounts },
    tapCounts: { ...zeroCounts },
    constellation: { ...zeroCounts },
    unlocked: { ...falseFlags },
  };

  try {
    savePlayer(player);
  } catch (error) {
    console.error('[Error] 新規プレイヤーの保存に失敗しました:', error);
    res.status(500).json({ success: false, error: 'プレイヤーデータの保存に失敗しました' });
    return;
  }

  // created_at is set inside savePlayer; read it back from DB
  try {
    const db = getDatabase();
    const row = db.prepare('SELECT created_at FROM Players WHERE id = ?').get(id) as { created_at?: string } | undefined;
    const createdAt = row?.created_at ?? now;

    res.json({
      success: true,
      player: {
        id,
        name: player.name,
        createdAt,
      },
    });
  } catch (err) {
    console.error('[Error] 新規プレイヤーの作成日時取得に失敗しました:', err);
    res.json({ success: true, player: { id, name: player.name, createdAt: now } });
  }
});

router.post('/reset-all', (_req, res) => {
  try {
    deleteAllPlayers();

    res.json({
      success: true,
      message: '全プレイヤーを削除しました',
    });
  } catch (error) {
    console.error('[Error] 全プレイヤー削除に失敗しました:', error);

    res.status(500).json({
      success: false,
      error: '全プレイヤー削除に失敗しました',
    });
  }
});

export default router;

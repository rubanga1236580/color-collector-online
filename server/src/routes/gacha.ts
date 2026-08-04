import { Router } from 'express';
import { getPlayer, savePlayer, getPlayerIdByServerId } from '../database/playerDatabase.js';
import type { PlayerData } from '../data/player.js';
import { COLORS } from '../data/colors.js';
import { GACHAS } from '../data/gacha.js';
import { getActiveGachas } from '../data/gachaManager.js';
import { getSelectedGachaId } from '../data/selectedGacha.js';
import { getPlayerIdFromRequest } from './serverContext.js';

const router = Router();
const CONSTELLATION_MAX = 5;
const activeGachaId = getSelectedGachaId();
type GachaRarity = 'normal' | 'rare' | 'superRare' | 'legendRare' | 'specialRare';
type GachaColor = keyof PlayerData['stocks'];

const currentGacha = GACHAS.find((gacha: { id: string; colorIds: string[] }) => gacha.id === activeGachaId);

if (!currentGacha) {
  throw new Error('基本ガチャデータが見つかりません');
}

function drawRarity(): GachaRarity {
  const roll = Math.random() * 100;

  if (roll < 50) {
    return 'normal';
  }

  if (roll < 80) {
    return 'rare';
  }

  if (roll < 95) {
    return 'superRare';
  }

  return 'legendRare';
}

function createInitialPlayer(id: string): PlayerData {
  const now = new Date().toISOString();
  const stocks = Object.fromEntries(COLORS.map((color) => [color.id, 0])) as PlayerData['stocks'];
  const unlocked = Object.fromEntries(COLORS.map((color) => [color.id, false])) as NonNullable<PlayerData['unlocked']>;
  const tapCounts = Object.fromEntries(COLORS.map((color) => [color.id, 0])) as PlayerData['tapCounts'];
  const constellation = Object.fromEntries(COLORS.map((color) => [color.id, 0])) as PlayerData['constellation'];

  return {
    id,
    name: 'Player',
    coins: 100
    energy: 0,
    energyMax: 5,
    lastEnergyUpdate: now,
    gachaTicket: 1,
    totalGachaCount: 0,
    totalPaintCount: 0,
    gachaLastClaimDate: '',
    stocks,
    unlocked,
    tapCounts,
    constellation,
  };
}

function getOrCreatePlayer(id: string): PlayerData | null {
  const existingPlayer = getPlayer(id);
  if (existingPlayer) {
    return existingPlayer;
  }

  const initialPlayer = createInitialPlayer(id);

  try {
    savePlayer(initialPlayer);
    return initialPlayer;
  } catch (error) {
    console.error('[Error] 初期プレイヤーデータの作成に失敗しました:', error);
    return null;
  }
}

router.get('/', (_req, res) => {
  const playerId = getPlayerIdFromRequest(_req);
  const player = getOrCreatePlayer(playerId);

  if (!player) {
    res.status(500).json({ error: 'プレイヤーデータの取得に失敗しました' });
    return;
  }

  res.json({
    gachaTicket: player.gachaTicket,
    canDraw: player.gachaTicket > 0,
  });
});

router.get('/active', (_req, res) => {
  const gachas = getActiveGachas();
  res.json(gachas);
});

router.post('/draw', (_req, res) => {
  const playerId = getPlayerIdFromRequest(_req);
  const player = getOrCreatePlayer(playerId);

  if (!player) {
    res.status(500).json({ error: 'プレイヤーデータの取得に失敗しました' });
    return;
  }

  if (player.gachaTicket < 1) {
    res.status(400).json({ error: 'ガチャチケットが不足しています' });
    return;
  }

  const rarity = drawRarity();
  const candidates = COLORS.filter((color) => color.rarity === rarity);

  if (candidates.length < 1) {
    res.status(500).json({ error: 'このレア度の色が設定されていません' });
    return;
  }

  const selectedColor = candidates[Math.floor(Math.random() * candidates.length)];
  const drawColor = selectedColor.id as GachaColor;

  const unlockedMap = player.unlocked as Record<string, boolean>;
  const stocksMap = player.stocks as Record<string, number>;
  const constellationMap = player.constellation as Record<string, number>;

  if (typeof unlockedMap[drawColor] !== 'boolean') {
    unlockedMap[drawColor] = false;
  }

  if (typeof stocksMap[drawColor] !== 'number') {
    stocksMap[drawColor] = 0;
  }

  if (typeof constellationMap[drawColor] !== 'number') {
    constellationMap[drawColor] = 0;
  }

  const isNew = !player.unlocked?.[drawColor];

  if (!player.unlocked) {
    player.unlocked = Object.fromEntries(
      COLORS.map((color) => [color.id, false])
    ) as PlayerData['unlocked'];
  }

  const hadColor = !isNew;

  player.gachaTicket = Math.max(0, player.gachaTicket - 1);
  player.totalGachaCount = (player.totalGachaCount ?? 0) + 1;
  if (!hadColor) {
    unlockedMap[drawColor] = true;
    player.stocks[drawColor] += 1;
  } else if (player.constellation[drawColor] < CONSTELLATION_MAX) {
    player.constellation[drawColor] += 1;
  } else {
    player.energy += 1;
  }

  try {
    savePlayer(player);
  } catch (error) {
    console.error('[Error] プレイヤーデータの保存に失敗しました:', error);
    res.status(500).json({ error: 'プレイヤーデータの保存に失敗しました' });
    return;
  }

  res.json({
    success: true,
    color: drawColor,
    rarity,
    isNew,
    gachaTicket: player.gachaTicket,
    stock: player.stocks[drawColor],
    constellation: player.constellation[drawColor],
    player,
  });
});

export default router;

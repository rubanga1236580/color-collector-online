import { Router } from 'express';
import { playerData, type PlayerData } from '../data/player.js';
import { COLORS } from '../data/colors.js';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { savePlayer, getPlayer, getPlayerIdByServerId } from '../database/playerDatabase.js';
import { getPlayerIdFromRequest } from './serverContext.js';

const router = Router();
const validColors = COLORS.map((color) => color.id);
const validColorSet = new Set(validColors);
type ValidatedPlayerPayload = PlayerData;

function buildNumberMap(source?: Record<string, unknown>): PlayerData['stocks'] {
  return Object.fromEntries(
    validColors.map((colorId) => [
      colorId,
      typeof source?.[colorId] === 'number' ? (source[colorId] as number) : 0,
    ]),
  ) as PlayerData['stocks'];
}

function buildBooleanMap(source?: Record<string, unknown>): NonNullable<PlayerData['unlocked']> {
  return Object.fromEntries(
    validColors.map((colorId) => [
      colorId,
      typeof source?.[colorId] === 'boolean' ? (source[colorId] as boolean) : false,
    ]),
  ) as NonNullable<PlayerData['unlocked']>;
}

function getRequiredTapCount(constellation: number): number {
  switch (constellation) {
    case 0:
      return 100;
    case 1:
      return 95;
    case 2:
      return 90;
    case 3:
      return 85;
    case 4:
      return 80;
    default:
      return 70;
  }
}

function isTapColor(value: unknown): value is string {
  return typeof value === 'string' && validColorSet.has(value);
}

function isNumberValue(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isColorRecord(value: unknown): value is Record<string, number> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;

  return validColors.every((color) => isNumberValue(record[color]));
}

function isUnlockedRecord(value: unknown): value is Record<string, boolean> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;

  return validColors.every((color) => typeof record[color] === 'boolean');
}

function isPlayerDataPayload(value: unknown): value is ValidatedPlayerPayload {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const payload = value as Record<string, unknown>;

  if (typeof payload.id !== 'string' || payload.id.trim() === '') {
    return false;
  }

  if (typeof payload.name !== 'string' || payload.name.trim() === '') {
    return false;
  }

  if (typeof payload.lastEnergyUpdate !== 'string' || payload.lastEnergyUpdate.trim() === '') {
    return false;
  }

  if (typeof payload.gachaLastClaimDate !== 'string') {
    return false;
  }

  return (
    isNumberValue(payload.coins) &&
    isNumberValue(payload.energy) &&
    isNumberValue(payload.energyMax) &&
    isNumberValue(payload.gachaTicket) &&
    isNumberValue(payload.totalGachaCount) &&
    isNumberValue(payload.totalPaintCount) &&
    isColorRecord(payload.stocks) &&
    isUnlockedRecord(payload.unlocked) &&
    isColorRecord(payload.tapCounts) &&
    isColorRecord(payload.constellation)
  );
}

function toDateKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function createInitialPlayerData(id: string): ValidatedPlayerPayload {
  const now = new Date().toISOString();

  return {
    id,
    name: 'Player',
    coins: 1000,
    energy: 0,
    energyMax: 5,
    lastEnergyUpdate: now,
    gachaTicket: 0,
    totalGachaCount: 0,
    totalPaintCount: 0,
    gachaLastClaimDate: '',
    stocks: buildNumberMap(),
    unlocked: buildBooleanMap(),
    tapCounts: buildNumberMap(),
    constellation: buildNumberMap(),
  };
}

router.get('/', (_req, res) => {
  const playerId = getPlayerIdFromRequest(_req);

  // SQLiteからプレイヤー情報を取得
  const dbPlayer = getPlayer(playerId);
  
  // SQLiteにデータが存在する場合は使用、無い場合はメモリのplayerDataを返す
  const player = dbPlayer || playerData;
  res.setHeader('X-Energy-Interval-Ms', String(GAME_CONFIG.ENERGY_INTERVAL_MS));
  res.json(player);
});

router.post('/', (req, res) => {
  const payload = req.body as unknown;

  if (!payload || typeof payload !== 'object' || !('id' in (payload as Record<string, unknown>))) {
    res.status(400).json({ error: 'プレイヤーデータが不正です（idが必要です）' });
    return;
  }

  if (!isPlayerDataPayload(payload)) {
    res.status(400).json({ error: 'プレイヤーデータの形式が不正です' });
    return;
  }

  // SQLiteに保存
  try {
    savePlayer(payload);

    // DB未作成時のフォールバック用メモリも同期しておく
    playerData.id = payload.id;
    playerData.name = payload.name;
    playerData.coins = payload.coins;
    playerData.energy = payload.energy;
    playerData.energyMax = payload.energyMax;
    playerData.lastEnergyUpdate = payload.lastEnergyUpdate;
    playerData.gachaTicket = payload.gachaTicket;
    playerData.totalGachaCount = payload.totalGachaCount;
    playerData.totalPaintCount = payload.totalPaintCount;
    playerData.gachaLastClaimDate = payload.gachaLastClaimDate;
    playerData.constellation = payload.constellation;
    playerData.stocks = payload.stocks;
    playerData.unlocked = payload.unlocked;
    playerData.tapCounts = payload.tapCounts;
  } catch (error) {
    console.error('[Error] プレイヤーデータの保存に失敗しました:', error);
    res.status(500).json({ error: 'プレイヤーデータの保存に失敗しました' });
    return;
  }

  res.json({ success: true, player: payload });
});

router.post('/collect-energy', (_req, res) => {
  const playerId = getPlayerIdFromRequest(_req);

  // プレイヤー取得
  const player = getPlayer(playerId);
  if (!player) {
    res.status(500).json({ error: 'プレイヤーデータの取得に失敗しました' });
    return;
  }

  // stocksの最大値を取得
  const maxStock = Math.max(...Object.values(player.stocks));

  // 獲得コイン計算
  const reward = player.energy * maxStock;

  // プレイヤー情報を更新
  player.coins += reward;
  player.energy = 0;
 
  // SQLiteに保存
  try {
    savePlayer(player);
  } catch (error) {
    console.error('[Error] プレイヤーデータの保存に失敗しました:', error);
    res.status(500).json({ error: 'プレイヤーデータの保存に失敗しました' });
    return;
  }

  res.json({
    success: true,
    reward,
    player,
  });
});

router.post('/claim-daily-ticket', (_req, res) => {
  const playerId = getPlayerIdFromRequest(_req);
  const player = getPlayer(playerId);

  if (!player) {
    res.status(500).json({ error: 'プレイヤーデータの取得に失敗しました' });
    return;
  }

  const todayKey = toDateKey(new Date());
  const lastClaimDate = player.gachaLastClaimDate;
  let lastClaimKey = '';

  if (lastClaimDate) {
    const lastClaimAt = new Date(lastClaimDate);
    if (!Number.isNaN(lastClaimAt.getTime())) {
      lastClaimKey = toDateKey(lastClaimAt);
    }
  }

  if (lastClaimKey === todayKey) {
    res.json({
      success: true,
      claimed: false,
      message: '今日は受け取り済みです',
      player,
    });
    return;
  }

  player.gachaTicket += 1;
  player.gachaLastClaimDate = new Date().toISOString();

  try {
    savePlayer(player);
  } catch (error) {
    console.error('[Error] プレイヤーデータの保存に失敗しました:', error);
    res.status(500).json({ error: 'プレイヤーデータの保存に失敗しました' });
    return;
  }

  res.json({
    success: true,
    claimed: true,
    message: 'チケットを1枚受け取りました',
    player,
  });
});

router.post('/tap-color', (req, res) => {
  const playerId = getPlayerIdFromRequest(req);
  const { color } = req.body as { color?: unknown };

  if (!isTapColor(color)) {
    res.status(400).json({ error: '色の指定が不正です' });
    return;
  }

  const player = getPlayer(playerId);
  if (!player) {
    res.status(500).json({ error: 'プレイヤーデータの取得に失敗しました' });
    return;
  }

  if (!player.unlocked) {
    player.unlocked = buildBooleanMap();
  }

  const unlockedMap = player.unlocked as Record<string, boolean>;
  const tapCountsMap = player.tapCounts as Record<string, number>;
  const stocksMap = player.stocks as Record<string, number>;
  const constellationMap = player.constellation as Record<string, number>;

  if (typeof unlockedMap[color] !== 'boolean') {
    unlockedMap[color] = false;
  }

  if (typeof tapCountsMap[color] !== 'number') {
    tapCountsMap[color] = 0;
  }

  if (typeof stocksMap[color] !== 'number') {
    stocksMap[color] = 0;
  }

  if (typeof constellationMap[color] !== 'number') {
    constellationMap[color] = 0;
  }

  tapCountsMap[color] += 1;

  const requiredTapCount = getRequiredTapCount(constellationMap[color]);
  if (tapCountsMap[color] >= requiredTapCount) {
    stocksMap[color] += 1;
    unlockedMap[color] = true;
    tapCountsMap[color] = 0;
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
    color,
    tapCount: tapCountsMap[color],
    stock: stocksMap[color],
    constellation: constellationMap[color],
    player,
  });
});

router.post('/reset', (_req, res) => {
  const playerId = getPlayerIdFromRequest(_req);
  const initialPlayer = createInitialPlayerData(playerId);

  try {
    savePlayer(initialPlayer);

    playerData.id = initialPlayer.id;
    playerData.name = initialPlayer.name;
    playerData.coins = initialPlayer.coins;
    playerData.energy = initialPlayer.energy;
    playerData.energyMax = initialPlayer.energyMax;
    playerData.lastEnergyUpdate = initialPlayer.lastEnergyUpdate;
    playerData.gachaTicket = initialPlayer.gachaTicket;
    playerData.totalGachaCount = initialPlayer.totalGachaCount;
    playerData.totalPaintCount = initialPlayer.totalPaintCount;
    playerData.gachaLastClaimDate = initialPlayer.gachaLastClaimDate;
    playerData.stocks = initialPlayer.stocks;
    playerData.unlocked = initialPlayer.unlocked;
    playerData.tapCounts = initialPlayer.tapCounts;
    playerData.constellation = initialPlayer.constellation;
  } catch (error) {
    console.error('[Error] プレイヤーデータのリセットに失敗しました:', error);
    res.status(500).json({ error: 'プレイヤーデータのリセットに失敗しました' });
    return;
  }

  res.json({
    success: true,
    player: initialPlayer,
  });
});

export default router;

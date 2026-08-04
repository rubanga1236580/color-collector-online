import { Router } from 'express';
import { mapData } from '../data/map.js';
import { COLORS } from '../data/colors.js';
import { saveMap, loadMap } from '../database/mapDatabase.js';
import { getPlayer, savePlayer, getPlayerIdByServerId } from '../database/playerDatabase.js';
import type { PlayerData } from '../data/player.js';
import { getMapIdFromRequest, getPlayerIdFromRequest } from './serverContext.js';

const router = Router();
const colorIds = COLORS.map((color) => color.id);
const colorIdSet = new Set(colorIds);

// 色の有効性をチェック
function isValidColor(color: unknown): color is string {
  return typeof color === 'string' && colorIdSet.has(color);
}

router.get('/', (_req, res) => {
  const mapId = getMapIdFromRequest(_req);

  try {
    // SQLiteから読み込む
    const cells = loadMap(mapId);

    // SQLiteのデータをレスポンス
    res.json({
      width: mapData.width,
      height: mapData.height,
      cells: cells,
    });
  } catch (error) {
    console.error('[Error] マップデータの読み込みに失敗しました:', error);
    res.status(500).json({ error: 'マップデータの読み込みに失敗しました' });
  }
});

router.post('/', (req, res) => {
  const mapId = getMapIdFromRequest(req);
  const playerId = getPlayerIdFromRequest(req);

  const { index, color } = req.body as {
    index?: unknown;
    color?: unknown;
  };

  // パラメータのバリデーション
  if (typeof index !== 'number' || !isValidColor(color)) {
    res.status(400).json({ error: 'リクエストが正しくありません' });
    return;
  }

  const colorKey = color as keyof PlayerData['stocks'];

  if (index < 0 || index >= mapData.cells.length) {
    res.status(400).json({ error: '指定したマスが存在しません' });
    return;
  }

  // プレイヤー情報を取得。存在しない場合は初期プレイヤーを作成して保存する
  let playerData = getPlayer(playerId);
  if (!playerData) {
    const now = new Date().toISOString();
    const initialConstellation = Object.fromEntries(
      colorIds.map((colorId) => [colorId, 0]),
    ) as PlayerData['constellation'];
    const initialStocks = Object.fromEntries(
      colorIds.map((colorId) => [colorId, 0]),
    ) as PlayerData['stocks'];
    const initialUnlocked = Object.fromEntries(
      colorIds.map((colorId) => [colorId, false]),
    ) as NonNullable<PlayerData['unlocked']>;
    const initialTapCounts = Object.fromEntries(
      colorIds.map((colorId) => [colorId, 0]),
    ) as PlayerData['tapCounts'];

    const initialPlayer: PlayerData = {
      id: playerId,
      name: 'Player',
      coins: 10000,
      energy: 5,
      energyMax: 5,
      lastEnergyUpdate: now,
      gachaTicket: 0,
      totalGachaCount: 0,
      totalPaintCount: 0,
      gachaLastClaimDate: '',
      constellation: initialConstellation,
      stocks: initialStocks,
      unlocked: initialUnlocked,
      tapCounts: initialTapCounts,
    };

    try {
      savePlayer(initialPlayer);
      console.log(`[Map] Created initial player: ${playerId}`);
      playerData = initialPlayer;
    } catch (error) {
      console.error('[Error] 初期プレイヤーデータの作成に失敗しました:', error);
      res.status(500).json({ error: '初期プレイヤーデータの作成に失敗しました' });
      return;
    }
  }

  // ゲームルール確認
  // 1. コインが100以上あるか
  if (playerData.coins < 100) {
    res.status(400).json({ error: 'コインが不足しています（100必要です）' });
    return;
  }

  // 2. 選択色の在庫が1以上あるか
  if (playerData.stocks[colorKey] < 1) {
    res.status(400).json({ error: `${color}の在庫が不足しています（1必要です）` });
    return;
  }

  // 条件を満たしたので処理を実行
  try {
    // プレイヤー情報を更新
    playerData.coins -= 100;
    playerData.stocks[colorKey] -= 1;
    playerData.totalPaintCount = (playerData.totalPaintCount ?? 0) + 1;

    // SQLiteへ保存
    savePlayer(playerData);
    console.log(`[Map] Player updated: coins=${playerData.coins}, ${color}=${playerData.stocks[colorKey]}`);

// SQLiteから現在のマップを読み込む
const cells = loadMap(mapId);

// そのマップを更新
cells[index] = color;

// 更新したマップを保存
saveMap(mapId, cells);

// メモリも同期
mapData.cells = cells;
    console.log(`[Map] Cell painted: index=${index}, color=${color}`);

    // 更新後のデータをレスポンス
    res.json({
      player: playerData,
      map: {
        width: mapData.width,
        height: mapData.height,
        cells: mapData.cells,
      },
    });
  } catch (error) {
    console.error('[Error] マスの塗りに失敗しました:', error);
    res.status(500).json({ error: 'マスの塗りに失敗しました' });
  }
});

export default router;

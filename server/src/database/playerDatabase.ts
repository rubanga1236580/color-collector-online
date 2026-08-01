import { getDatabase } from './db.js';
import type { PlayerData } from '../data/player.js';
import { GAME_CONFIG } from '../config/gameConfig.js';
import { COLORS } from '../data/colors.js';

type SavePlayerInput = Omit<PlayerData, 'gachaTicket' | 'gachaLastClaimDate' | 'constellation' | 'totalGachaCount' | 'totalPaintCount'> &
  Partial<Pick<PlayerData, 'gachaTicket' | 'gachaLastClaimDate' | 'constellation' | 'totalGachaCount' | 'totalPaintCount'>>;

const colorIds = COLORS.map((color) => color.id);

export function getPlayerIdByServerId(serverId: string): string {
  return `player-${serverId}-001`;
}

export type PlayerListItem = {
  id: string;
  name: string;
  totalPaintCount: number;
  totalGachaCount: number;
};

export function getPlayersByServerId(serverId: string): PlayerListItem[] {
  const db = getDatabase();
  const idPrefix = `player-${serverId}-%`;

  const stmt = db.prepare(`
    SELECT id, player_name, total_paint_count, total_gacha_count
    FROM Players
    WHERE id LIKE ?
    ORDER BY created_at ASC
  `);

  try {
    const rows = stmt.all(idPrefix) as Array<{
      id: string;
      player_name: string;
      total_paint_count?: number;
      total_gacha_count?: number;
    }>;

    return rows.map((row) => ({
      id: row.id,
      name: row.player_name,
      totalPaintCount: row.total_paint_count ?? 0,
      totalGachaCount: row.total_gacha_count ?? 0,
    }));
  } catch (error) {
    console.error(`[Database] プレイヤー一覧取得に失敗しました: ${serverId}`, error);
    return [];
  }
}

function buildNumberMap(source?: Record<string, unknown>): PlayerData['stocks'] {
  return Object.fromEntries(
    colorIds.map((colorId) => [
      colorId,
      typeof source?.[colorId] === 'number' ? (source[colorId] as number) : 0,
    ]),
  ) as PlayerData['stocks'];
}

function buildBooleanMap(source?: Record<string, unknown>): NonNullable<PlayerData['unlocked']> {
  return Object.fromEntries(
    colorIds.map((colorId) => [
      colorId,
      typeof source?.[colorId] === 'boolean' ? (source[colorId] as boolean) : false,
    ]),
  ) as NonNullable<PlayerData['unlocked']>;
}

/**
 * プレイヤー情報をSQLiteに保存する
 * 新規登録時は created_at に現在時刻を設定、既存レコード更新時は created_at を保持
 */
export function savePlayer(player: SavePlayerInput): void {
  const db = getDatabase();
  const now = new Date().toISOString();
  const normalizedPlayer: PlayerData = {
    ...player,
    gachaTicket: player.gachaTicket ?? 0,
    totalGachaCount: player.totalGachaCount ?? 0,
    totalPaintCount: player.totalPaintCount ?? 0,
    gachaLastClaimDate: player.gachaLastClaimDate ?? player.lastEnergyUpdate,
    constellation: buildNumberMap(player.constellation as Record<string, unknown> | undefined),
    tapCounts: buildNumberMap(player.tapCounts as Record<string, unknown> | undefined),
    unlocked: buildBooleanMap(player.unlocked as Record<string, unknown> | undefined),
  };

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO Players (id, player_name, coins, energy, energy_max, last_energy_update, stocks, tap_counts, gacha_ticket, total_gacha_count, total_paint_count, gacha_last_claim_date, constellation, created_at)
    VALUES (
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      COALESCE((SELECT created_at FROM Players WHERE id = ?), ?)
    )
  `);

  const normalizedUnlocked = buildBooleanMap(normalizedPlayer.unlocked as Record<string, unknown> | undefined);

  const stocksWithUnlocked = {
    ...buildNumberMap(normalizedPlayer.stocks as Record<string, unknown> | undefined),
    _unlocked: normalizedUnlocked,
  };

  try {
    stmt.run(
      normalizedPlayer.id,
      normalizedPlayer.name,
      normalizedPlayer.coins,
      normalizedPlayer.energy,
      normalizedPlayer.energyMax,
      normalizedPlayer.lastEnergyUpdate,
      JSON.stringify(stocksWithUnlocked),
      JSON.stringify(normalizedPlayer.tapCounts),
      normalizedPlayer.gachaTicket,
      normalizedPlayer.totalGachaCount,
      normalizedPlayer.totalPaintCount,
      normalizedPlayer.gachaLastClaimDate,
      JSON.stringify(normalizedPlayer.constellation),
      normalizedPlayer.id,
      now
    );
    console.log(`[Database] Player saved: ${normalizedPlayer.id}`);
  } catch (error) {
    console.error(`[Database] プレイヤー保存に失敗しました: ${normalizedPlayer.id}`, error);
    throw error;
  }
}

/**
 * SQLiteからプレイヤー情報を取得する
 * データが存在しない場合は null を返す
 * SQLiteのデータと メモリのPlayerDataを統合して返す
 */
export function getPlayer(id: string): PlayerData | null {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT id, player_name, coins, energy, energy_max, last_energy_update, stocks, tap_counts, gacha_ticket, total_gacha_count, total_paint_count, gacha_last_claim_date, constellation, created_at FROM Players WHERE id = ?
  `);

  try {
    const row = stmt.get(id) as
      | {
          id: string;
          player_name: string;
          coins: number;
          energy: number;
          energy_max: number;
          last_energy_update: string;
          stocks?: string;
          tap_counts?: string;
          gacha_ticket?: number;
          total_gacha_count?: number;
          total_paint_count?: number;
          gacha_last_claim_date?: string;
          constellation?: string;
          created_at: string;
        }
      | undefined;

    if (!row) {
      return null;
    }

    // SQLiteのデータを構築
    let stocksParsed: PlayerData['stocks'];
    let unlockedParsed: PlayerData['unlocked'];
    try {
      const parsed = row.stocks ? JSON.parse(row.stocks) as (Record<string, unknown> & {
        _unlocked?: Record<string, unknown>;
      }) : null;

      stocksParsed = buildNumberMap(parsed ?? undefined);
      unlockedParsed = buildBooleanMap(parsed?._unlocked);
    } catch (err) {
      console.warn('[Database] stocks JSON の解析に失敗したため、デフォルト値を使用します', err);
      stocksParsed = buildNumberMap();
      unlockedParsed = buildBooleanMap();
    }

    let tapCountsParsed: PlayerData['tapCounts'];
    try {
      tapCountsParsed = buildNumberMap(
        row.tap_counts ? (JSON.parse(row.tap_counts) as Record<string, unknown>) : undefined,
      );
    } catch (err) {
      console.warn('[Database] tap_counts JSON の解析に失敗したため、デフォルト値を使用します', err);
      tapCountsParsed = buildNumberMap();
    }

    let constellationParsed: PlayerData['constellation'];
    try {
      constellationParsed = buildNumberMap(
        row.constellation ? (JSON.parse(row.constellation) as Record<string, unknown>) : undefined,
      );
    } catch (err) {
      console.warn('[Database] constellation JSON の解析に失敗したため、デフォルト値を使用します', err);
      constellationParsed = buildNumberMap();
    }

    const player: PlayerData = {
      id: row.id,
      name: row.player_name,
      coins: row.coins,
      energy: row.energy,
      energyMax: row.energy_max,
      lastEnergyUpdate: row.last_energy_update,
      gachaTicket: row.gacha_ticket ?? 1,
      totalGachaCount: row.total_gacha_count ?? 0,
      totalPaintCount: row.total_paint_count ?? 0,
      gachaLastClaimDate: row.gacha_last_claim_date && row.gacha_last_claim_date.trim() !== ''
        ? row.gacha_last_claim_date
        : '',
      constellation: buildNumberMap(constellationParsed as Record<string, unknown>),
      stocks: stocksParsed,
      unlocked: unlockedParsed,
      tapCounts: buildNumberMap(tapCountsParsed as Record<string, unknown>),
    };

    // エナジー自動回復処理
    const now = new Date();
    const lastUpdate = new Date(player.lastEnergyUpdate);
    const elapsedMs = now.getTime() - lastUpdate.getTime();
    const energyGain = Math.floor(elapsedMs / GAME_CONFIG.ENERGY_INTERVAL_MS);

    if (energyGain > 0) {
      player.energy = Math.min(player.energy + energyGain, GAME_CONFIG.ENERGY_MAX);
      player.lastEnergyUpdate = new Date(lastUpdate.getTime() + energyGain * GAME_CONFIG.ENERGY_INTERVAL_MS).toISOString();
      savePlayer(player);
    }

    return player;
  } catch (error) {
    console.error(`[Database] プレイヤー取得に失敗しました: ${id}`, error);
    return null;
  }
}


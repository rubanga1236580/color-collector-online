import { getDatabase } from './db.js';
import { mapData } from '../data/map.js';

export function getCurrentServerId(): string {
  return 'server-001';
}

export function getMapIdByServerId(serverId: string): string {
  return `map-${serverId}`;
}

/**
 * マップのセル情報をSQLiteのCellsテーブルへ保存する
 * @param mapId - マップID（例："map-001"）
 * @param cells - セル配列（色情報の配列）
 */
export function saveMap(mapId: string, cells: string[]): void {
  const db = getDatabase();
  const now = new Date().toISOString();

  // 既存データをクリア（同じmap_idの全セルを削除）
  const deleteStmt = db.prepare('DELETE FROM Cells WHERE map_id = ?');
  try {
    deleteStmt.run(mapId);
  } catch (error) {
    console.error(`[Database] マップの古いセル削除に失敗しました: ${mapId}`, error);
    throw error;
  }

  // 新規データを一括挿入
  const insertStmt = db.prepare(`
    INSERT INTO Cells (map_id, cell_index, color, updated_at)
    VALUES (?, ?, ?, ?)
  `);

  try {
    const insertMany = db.transaction((data: Array<[string, number, string, string]>) => {
      for (const row of data) {
        insertStmt.run(...row);
      }
    });

    const cellData = cells.map((color, index) => [
      mapId,
      index,
      color,
      now,
    ] as [string, number, string, string]);

    insertMany(cellData);
    console.log(`[Database] Map saved: ${mapId} (${cells.length} cells)`);
  } catch (error) {
    console.error(`[Database] マップ保存に失敗しました: ${mapId}`, error);
    throw error;
  }
}

/**
 * SQLiteのCellsテーブルからマップセル情報を読み込む
 * @param mapId - マップID（例："map-001"）
 * @returns セル配列（色情報の配列）、データが存在しない場合は空配列
 */
export function loadMap(mapId: string): string[] {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT cell_index, color FROM Cells
    WHERE map_id = ?
    ORDER BY cell_index ASC
  `);

  try {
    const rows = stmt.all(mapId) as Array<{
      cell_index: number;
      color: string;
    }>;

    if (rows.length === 0) {
      console.log(`[Database] No cells found for map: ${mapId} - returning empty map`);
      const total = mapData.width * mapData.height;
      const emptyCells: string[] = new Array(total).fill('');
      return emptyCells;
    }

    // 事前に全マス分の配列を作成し、SQLiteから取得したセルのみ上書きする
    const total = mapData.width * mapData.height;
    const cells: string[] = new Array(total).fill('');

    for (const row of rows) {
      if (typeof row.cell_index === 'number' && row.cell_index >= 0 && row.cell_index < total) {
        cells[row.cell_index] = row.color;
      } else {
        console.warn(`[Database] Ignoring out-of-range cell_index ${row.cell_index} for map: ${mapId}`);
      }
    }

    console.log(`[Database] Map loaded: ${mapId} (${cells.length} cells)`);
    return cells;
  } catch (error) {
    console.error(`[Database] マップ読み込みに失敗しました: ${mapId}`, error);
    return [];
  }
}


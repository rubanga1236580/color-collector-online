import { ACTIVE_GACHA } from './activeGacha.js';
import { GACHAS, type GachaData } from './gacha.js';

export function getActiveGachas(): GachaData[] {
  const activeGachaIds = [...new Set([ACTIVE_GACHA.latest, ACTIVE_GACHA.revivalA, ACTIVE_GACHA.revivalB])];

  return activeGachaIds
    .map((gachaId) => GACHAS.find((gacha) => gacha.id === gachaId))
    .filter((gacha): gacha is GachaData => gacha !== undefined);
}

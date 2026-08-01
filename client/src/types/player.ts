import type { Color } from './color';

export type PlayerData = {
  id: string;
  name: string;
  coins: number;
  energy: number;
  energyMax: number;
  lastEnergyUpdate: string;
  gachaTicket: number;
  totalGachaCount: number;
  totalPaintCount: number;
  stocks: Record<Color, number>;
  unlocked: Record<Color, boolean>;
  tapCounts: Record<Color, number>;
  constellation: Record<Color, number>;
};

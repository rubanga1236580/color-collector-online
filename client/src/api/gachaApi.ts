import { withServerIdHeader } from './serverApi';
import { buildApiUrl } from './config';

export type GachaData = {
  id: string;
  name: string;
  colorIds: string[];
  specialRareEnabled: boolean;
};

export async function getActiveGachas(): Promise<GachaData[]> {
  const response = await fetch(buildApiUrl('/api/gacha/active'), withServerIdHeader({
    method: 'GET',
  }));

  if (!response.ok) {
    throw new Error('開催中ガチャの取得に失敗しました');
  }

  return response.json();
}

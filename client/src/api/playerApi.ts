import { withServerIdHeader } from './serverApi';
import { buildApiUrl } from './config';

export type PlayerListItem = {
  id: string;
  name: string;
  totalPaintCount: number;
  totalGachaCount: number;
};

type RegisterPlayerResponse = {
  success: boolean;
  player: {
    id: string;
    name: string;
    createdAt: string;
  };
};

export async function registerPlayer(name: string): Promise<RegisterPlayerResponse['player']> {
  const response = await fetch(buildApiUrl('/api/players'), withServerIdHeader({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  }));

  if (!response.ok) {
    throw new Error('プレイヤー登録に失敗しました');
  }

  const data = await response.json() as RegisterPlayerResponse;
  return data.player;
}

export async function getPlayers(): Promise<PlayerListItem[]> {
  const response = await fetch(buildApiUrl('/api/players'), withServerIdHeader({
    method: 'GET',
  }));

  if (!response.ok) {
    throw new Error('プレイヤー一覧の取得に失敗しました');
  }

  return response.json();
}

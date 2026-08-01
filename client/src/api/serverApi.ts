import { getSelectedServerId } from '../state/selectedServer';
import { getStoredPlayerId } from '../state/playerIdentity';
import { buildApiUrl } from './config';

const DEFAULT_SERVER_ID = 'server-001';

export type ServerListItem = {
  id: string;
  name: string;
  description: string;
};

export function getClientServerId(): string {
  return getSelectedServerId() || DEFAULT_SERVER_ID;
}

export function withServerIdHeader(init?: RequestInit): RequestInit {
  const serverId = getClientServerId();
  const playerId = getStoredPlayerId();
  const headers = new Headers(init?.headers);
  headers.set('x-server-id', serverId);
  if (playerId) {
    headers.set('x-player-id', playerId);
  }

  return {
    ...init,
    headers,
  };
}

export async function getServers(): Promise<ServerListItem[]> {
  const response = await fetch(buildApiUrl('/api/servers'), withServerIdHeader({
    method: 'GET',
  }));

  if (!response.ok) {
    throw new Error('サーバー一覧の取得に失敗しました');
  }

  return response.json();
}

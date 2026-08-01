const PLAYER_ID_STORAGE_KEY = 'colorCollectorPlayerId';

export function getStoredPlayerId(): string | null {
  return window.localStorage.getItem(PLAYER_ID_STORAGE_KEY);
}

export function setStoredPlayerId(playerId: string): void {
  window.localStorage.setItem(PLAYER_ID_STORAGE_KEY, playerId);
}

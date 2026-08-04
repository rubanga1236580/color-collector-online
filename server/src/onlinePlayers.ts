const onlinePlayers = new Map<string, number>();

export function updateOnlinePlayer(playerId: string) {
  onlinePlayers.set(playerId, Date.now());
}

export function getOnlinePlayerCount(): number {
  const now = Date.now();

  for (const [playerId, lastSeen] of onlinePlayers) {
    if (now - lastSeen > 30000) {
      onlinePlayers.delete(playerId);
    }
  }

  return onlinePlayers.size;
}

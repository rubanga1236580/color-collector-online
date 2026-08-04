const onlinePlayers = new Map<string, number>();

export function updateOnlinePlayer(playerId: string) {
  console.log("[ONLINE] update:", playerId);

  onlinePlayers.set(playerId, Date.now());

  console.log("[ONLINE] size:", onlinePlayers.size);
}

export function getOnlinePlayerCount(): number {
  const now = Date.now();

  for (const [playerId, lastSeen] of onlinePlayers) {
    if (now - lastSeen > 30000) {
      onlinePlayers.delete(playerId);
    }
  }

  console.log("[ONLINE] count:", onlinePlayers.size);

  return onlinePlayers.size;
}
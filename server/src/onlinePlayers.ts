const onlinePlayers = new Map<string, number>();

export function updateOnlinePlayer(playerId: string) {
  console.log("[ONLINE] update:", playerId);

  onlinePlayers.set(playerId, Date.now());

  console.log("[ONLINE] size:", onlinePlayers.size);
}

export function getOnlinePlayerCount(): number {
  const now = Date.now();

  for (const [playerId, lastSeen] of onlinePlayers) {
    if (now - lastSeen > 8000) {
      onlinePlayers.delete(playerId);
    }
  }

  console.log("[ONLINE] count:", onlinePlayers.size);

  return onlinePlayers.size;
}

export function removeOnlinePlayer(playerId: string) {
  onlinePlayers.delete(playerId);

  console.log("[ONLINE] remove:", playerId);
  console.log("[ONLINE] size:", onlinePlayers.size);
}
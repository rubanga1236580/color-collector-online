import type { Request } from 'express';
import { getCurrentServerId, getMapIdByServerId } from '../database/mapDatabase.js';
import { getPlayerIdByServerId } from '../database/playerDatabase.js';

function pickServerId(value: unknown): string | null {
  if (typeof value === 'string' && value.trim() !== '') {
    return value;
  }

  if (Array.isArray(value)) {
    const first = value.find((entry) => typeof entry === 'string' && entry.trim() !== '');
    return typeof first === 'string' ? first : null;
  }

  return null;
}

export function getServerIdFromRequest(req: Request): string {
  const fromHeader = pickServerId(req.header('x-server-id'));
  if (fromHeader) {
    return fromHeader;
  }

  const fromQuery = pickServerId(req.query.serverId);
  if (fromQuery) {
    return fromQuery;
  }

  return getCurrentServerId();
}

export function getMapIdFromRequest(req: Request): string {
  return getMapIdByServerId(getServerIdFromRequest(req));
}

export function getPlayerIdFromRequest(req: Request): string {
  const fromHeader = pickServerId(req.header('x-player-id'));
  if (fromHeader) {
    return fromHeader;
  }

  const fromQuery = pickServerId(req.query.playerId);
  if (fromQuery) {
    return fromQuery;
  }

  return getPlayerIdByServerId(getServerIdFromRequest(req));
}

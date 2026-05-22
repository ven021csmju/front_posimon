import { ABSOLUTE_API_URL } from '../services/api';

/** Build WebSocket URL from API base (https → wss, http → ws). */
export function getWebSocketUrl(token: string): string {
  const wsBase = ABSOLUTE_API_URL.replace(/^https/, 'wss').replace(/^http/, 'ws');
  return `${wsBase}/ws?token=${encodeURIComponent(token)}`;
}

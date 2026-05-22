import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { handleBackendNotification } from '../services/notification.service';
import type { BackendNotificationPayload } from '../types/notification';
import { getWebSocketUrl } from '../utils/wsUrl';

const WS_RECONNECT_MS = 5000;

export function useRealTimeNotifications() {
  const { user, token } = useAuthStore();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const authToken = token ?? localStorage.getItem('token');

    if (!user || !authToken) {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      if (socketRef.current?.readyState === WebSocket.OPEN) return;

      const socket = new WebSocket(getWebSocketUrl(authToken));
      socketRef.current = socket;

      socket.onopen = () => {
        if (import.meta.env.DEV) {
          console.log('[WebSocket] Connected for notifications');
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as BackendNotificationPayload;
          handleBackendNotification(data);
        } catch (e) {
          console.error('[WebSocket] Error parsing message:', e);
        }
      };

      socket.onclose = (event) => {
        socketRef.current = null;
        if (import.meta.env.DEV) {
          console.log('[WebSocket] Disconnected', event.code, event.reason || '');
        }
        if (!cancelled) {
          reconnectTimerRef.current = setTimeout(connect, WS_RECONNECT_MS);
        }
      };

      socket.onerror = () => {
        console.error('[WebSocket] Connection error');
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [user, token]);
}

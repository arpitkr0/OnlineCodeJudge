import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const getWsUrl = () => {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  if (import.meta.env.DEV || window.location.port === '5173') {
    return 'http://localhost:8080/ws/submissions';
  }
  return '/ws/submissions';
};

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  connect(onConnected, onError) {
    if (this.client && this.connected) {
      if (onConnected) onConnected();
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(getWsUrl()),
      reconnectDelay: 3000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('[WebSocket] Connected to real-time verdict broker');
        this.connected = true;
        if (onConnected) onConnected();
      },
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error', frame);
        if (onError) onError(frame);
      },
      onWebSocketClose: () => {
        console.log('[WebSocket] Connection closed');
        this.connected = false;
      }
    });

    this.client.activate();
  }

  subscribeToSubmission(submissionId, callback) {
    if (!this.client || !this.connected) {
      this.connect(() => {
        this._doSubscribe(submissionId, callback);
      });
      return;
    }
    this._doSubscribe(submissionId, callback);
  }

  _doSubscribe(submissionId, callback) {
    const topic = `/topic/submissions/${submissionId}`;
    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic).unsubscribe();
    }

    const sub = this.client.subscribe(topic, (message) => {
      try {
        const payload = JSON.parse(message.body);
        callback(payload);
      } catch (e) {
        console.error('[WebSocket] Failed to parse message', e);
      }
    });

    this.subscriptions.set(topic, sub);
  }

  unsubscribe(submissionId) {
    const topic = `/topic/submissions/${submissionId}`;
    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic).unsubscribe();
      this.subscriptions.delete(topic);
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      this.subscriptions.clear();
      console.log('[WebSocket] Disconnected');
    }
  }
}

export const wsService = new WebSocketService();
export default wsService;

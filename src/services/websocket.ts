import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  private client: Client | null = null;
  private token: string | null = null;
  private userId: number | null = null;
  private messageHandlers: Map<string, Set<(message: any) => void>> = new Map();
  private connectionHandlers: Set<(connected: boolean) => void> = new Set();
  private isConnected = false;
  private subscribedGroups: Set<number> = new Set();

  connect(userId: number, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userId = userId;
      this.token = token;

      this.client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws/chat'),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          this.isConnected = true;
          this.notifyConnection(true);
          this.subscribeToUserMessages();
          // Re-subscribe to groups
          this.subscribedGroups.forEach((groupId) => {
            this.subscribeToGroup(groupId);
          });
          resolve();
        },
        onDisconnect: () => {
          this.isConnected = false;
          this.notifyConnection(false);
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame.headers['message']);
          reject(new Error(frame.headers['message']));
        },
        onWebSocketClose: () => {
          this.isConnected = false;
          this.notifyConnection(false);
        },
        onWebSocketError: (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        },
      });

      this.client.activate();
    });
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
      this.subscribedGroups.clear();
    }
  }

  private subscribeToUserMessages() {
    if (!this.client || !this.userId) return;

    // Subscribe to personal messages
    this.client.subscribe(
      `/topic/messages/${this.userId}`,
      (message: IMessage) => {
        this.handleMessage('/topic/messages', JSON.parse(message.body));
      }
    );

    // Subscribe to user-specific queue
    this.client.subscribe(
      `/user/${this.userId}/queue/messages`,
      (message: IMessage) => {
        this.handleMessage('/user/queue', JSON.parse(message.body));
      }
    );
  }

  // Subscribe to group messages
  subscribeToGroup(groupId: number) {
    if (!this.client || !this.isConnected) {
      this.subscribedGroups.add(groupId);
      return;
    }

    this.subscribedGroups.add(groupId);

    this.client.subscribe(
      `/topic/group/${groupId}`,
      (message: IMessage) => {
        this.handleMessage('/topic/group', JSON.parse(message.body));
      }
    );
  }

  // Unsubscribe from group messages
  unsubscribeFromGroup(groupId: number) {
    if (!this.client) return;

    this.subscribedGroups.delete(groupId);

    this.client.unsubscribe(`/topic/group/${groupId}`);
  }

  private handleMessage(destination: string, payload: any) {
    const handlers = this.messageHandlers.get(destination);
    if (handlers) {
      handlers.forEach((handler) => handler(payload));
    }
  }

  private notifyConnection(connected: boolean) {
    this.connectionHandlers.forEach((handler) => handler(connected));
  }

  // Send message to a specific user
  sendMessage(receiverId: number, content: string, messageType: string = 'TEXT') {
    if (!this.client || !this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    this.client.publish({
      destination: `/app/chat/${receiverId}`,
      body: JSON.stringify({
        receiverId,
        content,
        messageType,
      }),
    });
  }

  // Send message to a group
  sendGroupMessage(groupId: number, content: string, messageType: string = 'TEXT') {
    if (!this.client || !this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    this.client.publish({
      destination: `/app/group/${groupId}`,
      body: JSON.stringify({
        content,
        messageType,
      }),
    });
  }

  // Subscribe to message handlers
  onMessage(destination: string, handler: (message: any) => void) {
    if (!this.messageHandlers.has(destination)) {
      this.messageHandlers.set(destination, new Set());
    }
    this.messageHandlers.get(destination)!.add(handler);
  }

  // Unsubscribe from message handlers
  offMessage(destination: string, handler: (message: any) => void) {
    const handlers = this.messageHandlers.get(destination);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  // Subscribe to connection status
  onConnection(handler: (connected: boolean) => void) {
    this.connectionHandlers.add(handler);
    handler(this.isConnected);
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const webSocketService = new WebSocketService();

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { type Message, type ChatHistoryItem } from '../types';
import { messageApi } from '../services/api';
import { webSocketService } from '../services/websocket';
import { useAuth } from './AuthContext';

interface ChatContextType {
  chatList: ChatHistoryItem[];
  messages: Record<number, Message[]>;
  currentChatUserId: number | null;
  isConnected: boolean;
  isLoading: boolean;
  refreshChatList: () => Promise<void>;
  loadMessages: (userId: number) => Promise<void>;
  sendMessage: (receiverId: number, content: string, messageType?: string) => void;
  setCurrentChatUserId: (userId: number | null) => void;
  markAsRead: (userId: number) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [chatList, setChatList] = useState<ChatHistoryItem[]>([]);
  const [messages, setMessages] = useState<Record<number, Message[]>>({});
  const [currentChatUserId, setCurrentChatUserId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Connect WebSocket when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      if (token) {
        webSocketService.connect(user.id, token).then(() => {
          setIsConnected(true);
        }).catch((err) => {
          console.error('WebSocket connection failed:', err);
          setIsConnected(false);
        });
      }
    } else {
      webSocketService.disconnect();
      setIsConnected(false);
    }

    return () => {
      webSocketService.disconnect();
    };
  }, [isAuthenticated, user]);

  // Listen for incoming messages
  useEffect(() => {
    const handleMessage = (message: Message) => {
      const otherUserId = message.senderId;
      setMessages((prev) => ({
        ...prev,
        [otherUserId]: [...(prev[otherUserId] || []), message],
      }));

      // Refresh chat list to update last message
      refreshChatList();
    };

    webSocketService.onMessage('/topic/messages', handleMessage);

    return () => {
      webSocketService.offMessage('/topic/messages', handleMessage);
    };
  }, []);

  // Listen for connection status
  useEffect(() => {
    webSocketService.onConnection((connected) => {
      setIsConnected(connected);
    });
  }, []);

  const refreshChatList = useCallback(async () => {
    try {
      const response = await messageApi.getChatList();
      setChatList(response.data);
    } catch (error) {
      console.error('Failed to fetch chat list:', error);
    }
  }, []);

  const loadMessages = useCallback(async (userId: number) => {
    setIsLoading(true);
    try {
      const response = await messageApi.getChatHistory(userId);
      setMessages((prev) => ({
        ...prev,
        [userId]: response.data,
      }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback((receiverId: number, content: string, messageType: string = 'TEXT') => {
    webSocketService.sendMessage(receiverId, content, messageType);

    // Add message to local state
    const newMessage: Message = {
      id: Date.now(),
      senderId: user!.id,
      receiverId,
      senderUsername: user!.username,
      receiverUsername: '',
      content,
      messageType,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [receiverId]: [...(prev[receiverId] || []), newMessage],
    }));

    // Refresh chat list
    refreshChatList();
  }, [user, refreshChatList]);

  const markAsRead = useCallback(async (userId: number) => {
    try {
      await messageApi.markAsRead(userId);
      // Update local state to mark messages as read
      setMessages((prev) => ({
        ...prev,
        [userId]: (prev[userId] || []).map((msg) => ({ ...msg, isRead: true })),
      }));
      refreshChatList();
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }, [refreshChatList]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      refreshChatList();
    }
  }, [isAuthenticated, refreshChatList]);

  return (
    <ChatContext.Provider
      value={{
        chatList,
        messages,
        currentChatUserId,
        isConnected,
        isLoading,
        refreshChatList,
        loadMessages,
        sendMessage,
        setCurrentChatUserId,
        markAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

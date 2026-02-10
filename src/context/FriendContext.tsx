import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type Friend, type FriendRequest } from '../types';
import { friendApi } from '../services/api';

interface FriendContextType {
  friends: Friend[];
  pendingRequests: FriendRequest[];
  isLoading: boolean;
  refreshFriends: () => Promise<void>;
  refreshPendingRequests: () => Promise<void>;
  sendFriendRequest: (userId: number) => Promise<void>;
  acceptFriendRequest: (requestId: number) => Promise<void>;
  rejectFriendRequest: (requestId: number) => Promise<void>;
  removeFriend: (friendId: number) => Promise<void>;
}

const FriendContext = createContext<FriendContextType | undefined>(undefined);

export function FriendProvider({ children }: { children: ReactNode }) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshFriends = async () => {
    try {
      const response = await friendApi.getFriends();
      setFriends(response.data);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    }
  };

  const refreshPendingRequests = async () => {
    try {
      const response = await friendApi.getPendingRequests();
      setPendingRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
    }
  };

  const sendFriendRequest = async (userId: number) => {
    await friendApi.sendFriendRequest(userId);
    await refreshPendingRequests();
  };

  const acceptFriendRequest = async (requestId: number) => {
    await friendApi.handleFriendRequest(requestId, true);
    await refreshFriends();
    await refreshPendingRequests();
  };

  const rejectFriendRequest = async (requestId: number) => {
    await friendApi.handleFriendRequest(requestId, false);
    await refreshPendingRequests();
  };

  const removeFriend = async (friendId: number) => {
    await friendApi.deleteFriend(friendId);
    await refreshFriends();
  };

  // Initial fetch
  useEffect(() => {
    refreshFriends();
    refreshPendingRequests();
  }, []);

  return (
    <FriendContext.Provider
      value={{
        friends,
        pendingRequests,
        isLoading,
        refreshFriends,
        refreshPendingRequests,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        removeFriend,
      }}
    >
      {children}
    </FriendContext.Provider>
  );
}

export function useFriends() {
  const context = useContext(FriendContext);
  if (context === undefined) {
    throw new Error('useFriends must be used within a FriendProvider');
  }
  return context;
}

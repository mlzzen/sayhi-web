import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { type Group, type GroupMember, type GroupMessage } from '../types';
import { groupApi } from '../services/api';
import { webSocketService } from '../services/websocket';
import { useAuth } from './AuthContext';

interface GroupContextType {
  groups: Group[];
  currentGroup: Group | null;
  currentGroupMembers: GroupMember[];
  groupMessages: Record<number, GroupMessage[]>;
  isLoading: boolean;
  refreshGroups: () => Promise<void>;
  createGroup: (name: string, description?: string, memberIds?: number[]) => Promise<Group>;
  loadGroupDetails: (groupId: number) => Promise<void>;
  loadGroupMessages: (groupId: number) => Promise<void>;
  inviteMembers: (groupId: number, userIds: number[]) => Promise<void>;
  removeMember: (groupId: number, userId: number) => Promise<void>;
  leaveGroup: (groupId: number) => Promise<void>;
  sendGroupMessage: (groupId: number, content: string, messageType?: string) => void;
  setCurrentGroup: (group: Group | null) => void;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [currentGroupMembers, setCurrentGroupMembers] = useState<GroupMember[]>([]);
  const [groupMessages, setGroupMessages] = useState<Record<number, GroupMessage[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Listen for incoming group messages
  useEffect(() => {
    const handleGroupMessage = (message: GroupMessage) => {
      setGroupMessages((prev) => {
        const existingMessages = prev[message.groupId] || [];
        // 防止重复添加相同 ID 的消息
        if (existingMessages.some((m) => m.id === message.id)) {
          return prev;
        }
        return {
          ...prev,
          [message.groupId]: [...existingMessages, message],
        };
      });
    };

    webSocketService.onMessage('/topic/group', handleGroupMessage);

    return () => {
      webSocketService.offMessage('/topic/group', handleGroupMessage);
    };
  }, []);

  const refreshGroups = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await groupApi.getGroups();
      setGroups(response.data);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  }, [isAuthenticated]);

  const createGroup = useCallback(async (
    name: string,
    description?: string,
    memberIds?: number[]
  ): Promise<Group> => {
    setIsLoading(true);
    try {
      const response = await groupApi.createGroup({ name, description, memberIds });
      const newGroup = response.data;
      setGroups((prev) => [...prev, newGroup]);
      return newGroup;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadGroupDetails = useCallback(async (groupId: number) => {
    setIsLoading(true);
    try {
      const [groupResponse, membersResponse] = await Promise.all([
        groupApi.getGroup(groupId),
        groupApi.getGroupMembers(groupId),
      ]);
      setCurrentGroup(groupResponse.data);
      setCurrentGroupMembers(membersResponse.data);

      // Subscribe to group messages
      webSocketService.subscribeToGroup(groupId);
    } catch (error) {
      console.error('Failed to load group details:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadGroupMessages = useCallback(async (groupId: number) => {
    try {
      const response = await groupApi.getGroupMessages(groupId);
      setGroupMessages((prev) => ({
        ...prev,
        [groupId]: response.data,
      }));
    } catch (error) {
      console.error('Failed to load group messages:', error);
    }
  }, []);

  const inviteMembers = useCallback(async (groupId: number, userIds: number[]) => {
    try {
      await groupApi.inviteMembers(groupId, userIds);
      // Refresh group members
      const response = await groupApi.getGroupMembers(groupId);
      setCurrentGroupMembers(response.data);
    } catch (error) {
      console.error('Failed to invite members:', error);
      throw error;
    }
  }, []);

  const removeMember = useCallback(async (groupId: number, userId: number) => {
    try {
      await groupApi.removeMember(groupId, userId);
      // Refresh group members
      const response = await groupApi.getGroupMembers(groupId);
      setCurrentGroupMembers(response.data);
    } catch (error) {
      console.error('Failed to remove member:', error);
      throw error;
    }
  }, []);

  const leaveGroup = useCallback(async (groupId: number) => {
    try {
      await groupApi.leaveGroup(groupId);
      webSocketService.unsubscribeFromGroup(groupId);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      if (currentGroup?.id === groupId) {
        setCurrentGroup(null);
        setCurrentGroupMembers([]);
      }
    } catch (error) {
      console.error('Failed to leave group:', error);
      throw error;
    }
  }, [currentGroup]);

  const sendGroupMessage = useCallback((groupId: number, content: string, messageType: string = 'TEXT') => {
    // 只通过 WebSocket 发送消息，等待服务器广播后更新状态
    webSocketService.sendGroupMessage(groupId, content, messageType);
  }, []);

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      refreshGroups();
    }
  }, [isAuthenticated, refreshGroups]);

  return (
    <GroupContext.Provider
      value={{
        groups,
        currentGroup,
        currentGroupMembers,
        groupMessages,
        isLoading,
        refreshGroups,
        createGroup,
        loadGroupDetails,
        loadGroupMessages,
        inviteMembers,
        removeMember,
        leaveGroup,
        sendGroupMessage,
        setCurrentGroup,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups() {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
}

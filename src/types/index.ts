export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface FriendRequest {
  id: number;
  userId: number;
  username: string;
  avatarUrl: string | null;
  status: FriendshipStatus;
  createdAt: string;
}

export interface Friend {
  id: number;
  username: string;
  avatarUrl: string | null;
  status: FriendshipStatus;
  createdAt: string;
}

export interface CreateFriendRequest {
  userId: number;
}

export interface UpdateFriendRequest {
  accept: boolean;
}

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE';

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  senderUsername: string;
  receiverUsername: string;
  content: string;
  messageType: MessageType;
  isRead: boolean;
  createdAt: string;
}

export interface CreateMessageRequest {
  receiverId: number;
  content: string;
  messageType?: MessageType;
}

export interface ChatHistoryItem {
  friendId: number;
  friendUsername: string;
  friendAvatarUrl: string | null;
  lastMessage: Message | null;
  unreadCount: number;
}

// Group types
export interface Group {
  id: number;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  ownerId: number;
  ownerUsername: string;
  memberCount: number;
  createdAt: string;
}

export interface GroupMember {
  id: number;
  userId: number;
  username: string;
  avatarUrl: string | null;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

export interface GroupMessage {
  id: number;
  senderId: number;
  senderUsername: string;
  groupId: number;
  content: string;
  messageType: MessageType;
  createdAt: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  memberIds?: number[];
}

export interface InviteMemberRequest {
  userIds: number[];
}

export interface CreateGroupMessageRequest {
  content: string;
  messageType?: MessageType;
}

export interface ChatItem {
  type: 'user' | 'group';
  id: number;
  name: string;
  avatarUrl: string | null;
  lastMessage?: string;
  unreadCount: number;
  updatedAt?: string;
}

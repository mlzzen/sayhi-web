import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FriendProvider } from '../context/FriendContext';
import { ChatProvider, useChat } from '../context/ChatContext';
import { GroupProvider, useGroups } from '../context/GroupContext';
import { useFriends } from '../context/FriendContext';
import { FriendRequestNotification } from '../components/FriendRequestNotification';
import { ContactsPage } from './ContactsPage';
import { UserSearchPage } from './UserSearchPage';
import { ChatListPage } from './ChatListPage';
import { ChatWindow } from './ChatWindow';
import { GroupsPage } from './GroupsPage';
import { GroupChatWindow } from './GroupChatWindow';
import { Button } from '../components/ui/button';
import { type Group } from '../types';

type Tab = 'contacts' | 'search' | 'chat' | 'groups';

function ChatView({
  pendingChatUserId,
  pendingGroup,
}: {
  pendingChatUserId: number | null;
  pendingGroup: Group | null;
}) {
  const { chatList, currentChatUserId, setCurrentChatUserId } = useChat();
  const { groups, currentGroup, setCurrentGroup, loadGroupDetails } = useGroups();
  const { friends } = useFriends();

  React.useEffect(() => {
    if (pendingChatUserId) {
      setCurrentChatUserId(pendingChatUserId);
    }
    if (pendingGroup) {
      loadGroupDetails(pendingGroup.id);
      setCurrentGroup(pendingGroup);
    }
  }, [pendingChatUserId, pendingGroup, setCurrentChatUserId, loadGroupDetails, setCurrentGroup]);

  const getChatInfo = (friendId: number) => {
    const chat = chatList.find((c) => c.friendId === friendId);
    if (chat) {
      return chat;
    }
    const friend = friends.find((f) => f.id === friendId);
    if (friend) {
      return { friendUsername: friend.username, friendAvatarUrl: friend.avatarUrl };
    }
    return { friendUsername: 'Unknown', friendAvatarUrl: null };
  };

  return (
    <div className="flex h-full">
      <ChatListPage />
      {currentChatUserId && (
        <ChatWindow
          friendId={currentChatUserId}
          friendUsername={getChatInfo(currentChatUserId).friendUsername}
          friendAvatarUrl={getChatInfo(currentChatUserId).friendAvatarUrl}
          onClose={() => setCurrentChatUserId(null)}
        />
      )}
      {currentGroup && (
        <GroupChatWindow
          groupId={currentGroup.id}
          groupName={currentGroup.name}
          groupAvatarUrl={currentGroup.avatarUrl}
          onClose={() => setCurrentGroup(null)}
          onViewMembers={() => {
            // TODO: Show group members modal
          }}
        />
      )}
    </div>
  );
}

export function HomePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [pendingChatUserId, setPendingChatUserId] = useState<number | null>(null);
  const [pendingGroup, setPendingGroup] = useState<Group | null>(null);

  const handleChatClick = (friendId: number) => {
    setPendingChatUserId(friendId);
    setActiveTab('chat');
  };

  const handleOpenGroupChat = (group: Group) => {
    setPendingGroup(group);
    setActiveTab('chat');
  };

  return (
    <FriendProvider>
      <ChatProvider>
        <GroupProvider>
          <div className="h-screen flex flex-col bg-gray-50">
            <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
              <h1 className="text-xl font-semibold text-gray-900">SayHi</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            </header>

            <FriendRequestNotification />

            <nav className="flex gap-2 px-6 py-3 bg-white border-b border-gray-200">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'contacts'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('contacts')}
              >
                通讯录
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'search'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('search')}
              >
                添加好友
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'groups'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('groups')}
              >
                群聊
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('chat')}
              >
                消息
              </button>
            </nav>

            <main className="flex-1 overflow-hidden">
              {activeTab === 'contacts' && <ContactsPage onChatClick={handleChatClick} />}
              {activeTab === 'search' && <UserSearchPage />}
              {activeTab === 'groups' && <GroupsPage onOpenGroupChat={handleOpenGroupChat} />}
              {activeTab === 'chat' && (
                <ChatView pendingChatUserId={pendingChatUserId} pendingGroup={pendingGroup} />
              )}
            </main>
          </div>
        </GroupProvider>
      </ChatProvider>
    </FriendProvider>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FriendProvider } from '../context/FriendContext';
import { ChatProvider, useChat } from '../context/ChatContext';
import { FriendRequestNotification } from '../components/FriendRequestNotification';
import { ContactsPage } from './ContactsPage';
import { UserSearchPage } from './UserSearchPage';
import { ChatListPage } from './ChatListPage';
import { ChatWindow } from './ChatWindow';
import { Button } from '../components/ui/button';

type Tab = 'contacts' | 'search' | 'chat';

function ChatView({ pendingChatUserId }: { pendingChatUserId: number | null }) {
  const { chatList, currentChatUserId, setCurrentChatUserId } = useChat();

  React.useEffect(() => {
    if (pendingChatUserId) {
      setCurrentChatUserId(pendingChatUserId);
    }
  }, [pendingChatUserId, setCurrentChatUserId]);

  const getChatInfo = (friendId: number) => {
    const chat = chatList.find((c) => c.friendId === friendId);
    return chat || { friendUsername: 'Unknown', friendAvatarUrl: null };
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
    </div>
  );
}

export function HomePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [pendingChatUserId, setPendingChatUserId] = useState<number | null>(null);

  const handleChatClick = (friendId: number) => {
    setPendingChatUserId(friendId);
    setActiveTab('chat');
  };

  return (
    <FriendProvider>
      <ChatProvider>
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
            {activeTab === 'chat' && <ChatView pendingChatUserId={pendingChatUserId} />}
          </main>
        </div>
      </ChatProvider>
    </FriendProvider>
  );
}

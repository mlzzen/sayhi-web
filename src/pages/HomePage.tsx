import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FriendProvider } from '../context/FriendContext';
import { ChatProvider, useChat } from '../context/ChatContext';
import { FriendRequestNotification } from '../components/FriendRequestNotification';
import { ContactsPage } from './ContactsPage';
import { UserSearchPage } from './UserSearchPage';
import { ChatListPage } from './ChatListPage';
import { ChatWindow } from './ChatWindow';
import './HomePage.css';

type Tab = 'contacts' | 'search' | 'chat';

function ChatView({ pendingChatUserId }: { pendingChatUserId: number | null }) {
  const { chatList, currentChatUserId, setCurrentChatUserId } = useChat();

  // 如果有待处理的聊天请求，设置当前聊天用户
  React.useEffect(() => {
    if (pendingChatUserId) {
      setCurrentChatUserId(pendingChatUserId);
    }
  }, [pendingChatUserId, setCurrentChatUserId]);

  const getChatInfo = (friendId: number) => {
    console.log('chatList', chatList);
    
    console.log('friendId', friendId);
    
    const chat = chatList.find((c) => c.friendId === friendId);
    console.log('chat', chat);
    return chat || { friendUsername: '未知', friendAvatarUrl: null };
  };

  return (
    <div className="chat-view">
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
        <div className="home-container">
          <header className="home-header">
            <h1>SayHi</h1>
            <div className="user-info">
              <span>Welcome, {user?.username}</span>
              <button className="logout-button" onClick={logout}>
                Logout
              </button>
            </div>
          </header>

          <FriendRequestNotification />

          <nav className="home-nav">
            <button
              className={`nav-item ${activeTab === 'contacts' ? 'active' : ''}`}
              onClick={() => setActiveTab('contacts')}
            >
              通讯录
            </button>
            <button
              className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              添加好友
            </button>
            <button
              className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              消息
            </button>
          </nav>

          <main className="home-content">
            {activeTab === 'contacts' && <ContactsPage onChatClick={handleChatClick} />}
            {activeTab === 'search' && <UserSearchPage />}
            {activeTab === 'chat' && <ChatView pendingChatUserId={pendingChatUserId} />}
          </main>
        </div>
      </ChatProvider>
    </FriendProvider>
  );
}

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FriendProvider } from '../context/FriendContext';
import { ChatProvider } from '../context/ChatContext';
import { FriendRequestNotification } from '../components/FriendRequestNotification';
import { ContactsPage } from './ContactsPage';
import { UserSearchPage } from './UserSearchPage';
import { ChatListPage } from './ChatListPage';
import { ChatWindow } from './ChatWindow';
import { useChat } from '../context/ChatContext';
import './HomePage.css';

type Tab = 'contacts' | 'search' | 'chat';

function ChatView() {
  const { chatList, currentChatUserId, setCurrentChatUserId } = useChat();

  const getChatInfo = (friendId: number) => {
    const chat = chatList.find((c) => c.friendId === friendId);
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

  return (
    <FriendProvider>
      <ChatProvider>
        <div className="home-container">
          <header className="home-header">
            <h1>SayHi</h1>
            <div className="user-info">
              <span>Welcome, {user?.username}</span>
              <button onClick={logout} className="logout-button">
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
            {activeTab === 'contacts' && <ContactsPage />}
            {activeTab === 'search' && <UserSearchPage />}
            {activeTab === 'chat' && <ChatView />}
          </main>
        </div>
      </ChatProvider>
    </FriendProvider>
  );
}

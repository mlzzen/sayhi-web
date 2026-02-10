import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FriendProvider } from '../context/FriendContext';
import { FriendRequestNotification } from '../components/FriendRequestNotification';
import { ContactsPage } from './ContactsPage';
import { UserSearchPage } from './UserSearchPage';
import './HomePage.css';

type Tab = 'contacts' | 'search' | 'chat';

export function HomePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('contacts');

  return (
    <FriendProvider>
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
            聊天
          </button>
        </nav>

        <main className="home-content">
          {activeTab === 'contacts' && <ContactsPage />}
          {activeTab === 'search' && <UserSearchPage />}
          {activeTab === 'chat' && (
            <div className="coming-soon">
              <h2>聊天功能</h2>
              <p>实时消息功能正在开发中...</p>
            </div>
          )}
        </main>
      </div>
    </FriendProvider>
  );
}

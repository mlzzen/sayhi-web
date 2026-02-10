import { useState } from 'react';
import { type User } from '../types';
import { userApi } from '../services/api';
import { useFriends } from '../context/FriendContext';
import './UserSearchPage.css';

export function UserSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { friends, sendFriendRequest } = useFriends();

  const isFriend = (userId: number) => friends.some((f) => f.id === userId);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setMessage('');
    try {
      const response = await userApi.searchUsers(query);
      setResults(response.data || []);
      if (Array.isArray(response.data) && response.data.length === 0) {
        setMessage('未找到用户');
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || '搜索失败');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId: number) => {
    try {
      await sendFriendRequest(userId);
      setMessage('好友请求已发送');
      // Refresh the list to show updated status
      setResults((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, email: '请求已发送' } : u))
      );
    } catch (error: any) {
      setMessage(error.response?.data?.message || '发送请求失败');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h2>添加好友</h2>
        <p>搜索用户名或邮箱来添加好友</p>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="输入用户名或邮箱"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? '搜索中...' : '搜索'}
        </button>
      </div>

      {message && <div className="search-message">{message}</div>}

      <div className="search-results">
        {results.map((user) => (
          <div key={user.id} className="user-item">
            <div className="avatar">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} />
              ) : (
                <div className="avatar-placeholder">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="user-info">
              <span className="username">{user.username}</span>
              <span className="email">{user.email}</span>
            </div>
            {isFriend(user.id) ? (
              <button className="action-btn added" disabled>
                已是好友
              </button>
            ) : (
              <button
                className="action-btn add"
                onClick={() => handleAddFriend(user.id)}
              >
                添加
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

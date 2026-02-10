import { useState } from 'react';
import { type User } from '../types';
import { userApi } from '../services/api';
import { useFriends } from '../context/FriendContext';
import { Avatar } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

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
    <div className="p-5 max-w-lg mx-auto h-full overflow-auto">
      <div className="mb-5">
        <h2 className="text-xl font-semibold mb-1">添加好友</h2>
        <p className="text-sm text-gray-500">搜索用户名或邮箱来添加好友</p>
      </div>

      <div className="flex gap-2.5 mb-5">
        <Input
          className="flex-1"
          placeholder="输入用户名或邮箱"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? '搜索中...' : '搜索'}
        </Button>
      </div>

      {message && (
        <div className="text-center py-2.5 mb-5 text-sm text-gray-600 bg-gray-50 rounded-lg">
          {message}
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {results.map((user) => (
          <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Avatar
              src={user.avatarUrl}
              alt={user.username}
              fallback={user.username.charAt(0).toUpperCase()}
            />
            <div className="flex-1 min-w-0">
              <span className="font-medium block truncate">{user.username}</span>
              <span className="text-xs text-gray-500 truncate block">{user.email}</span>
            </div>
            {isFriend(user.id) ? (
              <Button variant="success" size="sm" disabled>
                已是好友
              </Button>
            ) : (
              <Button size="sm" onClick={() => handleAddFriend(user.id)}>
                添加
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

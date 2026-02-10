import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';

export function ChatListPage() {
  const { chatList, messages, setCurrentChatUserId } = useChat();
  const { user } = useAuth();

  const getUnreadCount = (friendId: number) => {
    const userMessages = messages[friendId] || [];
    return userMessages.filter((m) => !m.isRead && m.senderId === friendId).length;
  };

  const formatTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return date.toLocaleDateString('zh-CN', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  const handleChatClick = (friendId: number) => {
    setCurrentChatUserId(friendId);
  };

  return (
    <div className="h-full flex flex-col border-r border-gray-200 w-80 bg-white">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold">消息</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chatList.length === 0 ? (
          <div className="text-center py-15 text-gray-400">
            <p>暂无聊天记录</p>
            <p className="text-sm mt-1">开始和好友聊天吧！</p>
          </div>
        ) : (
          chatList.map((chat) => {
            const unreadCount = getUnreadCount(chat.friendId);

            return (
              <div
                key={chat.friendId}
                className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors border-b border-gray-50 ${
                  unreadCount > 0 ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleChatClick(chat.friendId)}
              >
                <Avatar
                  src={chat.friendAvatarUrl}
                  alt={chat.friendUsername}
                  fallback={chat.friendUsername.charAt(0).toUpperCase()}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{chat.friendUsername}</span>
                    <span className="text-xs text-gray-400">
                      {chat.lastMessage ? formatTime(chat.lastMessage.createdAt) : ''}
                    </span>
                  </div>
                  <div className="mt-0.5">
                    {chat.lastMessage ? (
                      <span
                        className={`text-sm truncate block ${
                          unreadCount > 0 ? 'font-medium text-gray-800' : 'text-gray-500'
                        }`}
                      >
                        {chat.lastMessage.senderId === user?.id && '我: '}
                        {chat.lastMessage.content}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-300">暂无消息</span>
                    )}
                  </div>
                </div>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="shrink-0">
                    {unreadCount}
                  </Badge>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

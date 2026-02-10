import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import './ChatListPage.css';

export function ChatListPage() {
  const { chatList, messages, setCurrentChatUserId, refreshChatList } = useChat();
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
    <div className="chat-list-page">
      <div className="chat-list-header">
        <h2>消息</h2>
      </div>

      <div className="chat-list">
        {chatList.length === 0 ? (
          <div className="empty-state">
            <p>暂无聊天记录</p>
            <p className="hint">开始和好友聊天吧！</p>
          </div>
        ) : (
          chatList.map((chat) => {
            const unreadCount = getUnreadCount(chat.friendId);
            const isActive = chat.friendId === messages[chat.friendId]?.[0]?.receiverId;

            return (
              <div
                key={chat.friendId}
                className={`chat-item ${unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={() => handleChatClick(chat.friendId)}
              >
                <div className="avatar">
                  {chat.friendAvatarUrl ? (
                    <img src={chat.friendAvatarUrl} alt={chat.friendUsername} />
                  ) : (
                    <div className="avatar-placeholder">
                      {chat.friendUsername.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="chat-info">
                  <div className="chat-info-header">
                    <span className="username">{chat.friendUsername}</span>
                    <span className="time">
                      {chat.lastMessage ? formatTime(chat.lastMessage.createdAt) : ''}
                    </span>
                  </div>
                  <div className="last-message">
                    {chat.lastMessage ? (
                      <span className={unreadCount > 0 ? 'unread' : ''}>
                        {chat.lastMessage.senderId === user?.id && '我: '}
                        {chat.lastMessage.content}
                      </span>
                    ) : (
                      <span className="no-message">暂无消息</span>
                    )}
                  </div>
                </div>
                {unreadCount > 0 && (
                  <div className="unread-badge">{unreadCount}</div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

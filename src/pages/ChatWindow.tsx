import { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import './ChatWindow.css';

interface ChatWindowProps {
  friendId: number;
  friendUsername: string;
  friendAvatarUrl: string | null;
  onClose: () => void;
}

export function ChatWindow({ friendId, friendUsername, friendAvatarUrl, onClose }: ChatWindowProps) {
  const { user } = useAuth();
  const { messages, loadMessages, sendMessage, markAsRead, isConnected } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatMessages = messages[friendId] || [];

  // Load messages when opening chat
  useEffect(() => {
    loadMessages(friendId);
    markAsRead(friendId);
  }, [friendId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    setIsSending(true);
    try {
      sendMessage(friendId, inputValue.trim());
      setInputValue('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="avatar small">
            {friendAvatarUrl ? (
              <img src={friendAvatarUrl} alt={friendUsername} />
            ) : (
              <div className="avatar-placeholder">
                {friendUsername.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className="username">{friendUsername}</span>
          {!isConnected && <span className="connection-status offline">离线</span>}
        </div>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="messages-container">
        {chatMessages.length === 0 ? (
          <div className="empty-chat">
            <p>暂无消息，开始聊天吧！</p>
          </div>
        ) : (
          chatMessages.map((message) => {
            const isOwn = message.senderId === user?.id;
            return (
              <div key={message.id} className={`message ${isOwn ? 'own' : 'other'}`}>
                <div className="message-content">
                  <div className="message-text">{message.content}</div>
                  <div className="message-time">{formatTime(message.createdAt)}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          ref={inputRef}
          type="text"
          placeholder="输入消息..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isSending}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={!inputValue.trim() || isSending}
        >
          发送
        </button>
      </div>
    </div>
  );
}

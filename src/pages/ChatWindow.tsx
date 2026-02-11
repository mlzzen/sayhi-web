import { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ImagePicker } from '../components/ImagePicker';
import { fileApi } from '../services/api';

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
  const [showImagePicker, setShowImagePicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatMessages = messages[friendId] || [];

  useEffect(() => {
    loadMessages(friendId);
    markAsRead(friendId);
  }, [friendId]);

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

  const handleSendImage = async (file: File) => {
    setIsSending(true);
    try {
      const { url } = await fileApi.upload(file);
      sendMessage(friendId, url, 'IMAGE');
      setShowImagePicker(false);
    } catch (error) {
      console.error('Failed to send image:', error);
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

  const isImageUrl = (content: string) => {
    return content.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null ||
           content.startsWith('http://') || content.startsWith('https://');
  };

  return (
    <div className="flex flex-col h-full bg-white w-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2.5">
          <Avatar
            src={friendAvatarUrl}
            alt={friendUsername}
            fallback={friendUsername.charAt(0).toUpperCase()}
            className="h-8 w-8"
          />
          <span className="font-medium">{friendUsername}</span>
          {!isConnected && (
            <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-500 rounded">
              离线
            </span>
          )}
        </div>
        <button
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1.5 rounded-md transition-colors"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {chatMessages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p>暂无消息，开始聊天吧！</p>
          </div>
        ) : (
          chatMessages.map((message) => {
            const isOwn = message.senderId === user?.id;
            const isImage = message.messageType === 'IMAGE' || isImageUrl(message.content);
            return (
              <div
                key={message.id}
                className={`flex max-w-[70%] ${isOwn ? 'self-end' : 'self-start'}`}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl max-w-full ${
                    isOwn
                      ? 'bg-primary-500 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}
                >
                  {isImage ? (
                    <img
                      src={message.content}
                      alt="Image"
                      className="max-w-full rounded-lg cursor-pointer hover:opacity-90"
                      onClick={() => window.open(message.content, '_blank')}
                    />
                  ) : (
                    <div className="break-words leading-relaxed">{message.content}</div>
                  )}
                  <div
                    className={`text-xs mt-1 opacity-70 text-right ${
                      isOwn ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {showImagePicker && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <ImagePicker
            onImageSelect={handleSendImage}
            onCancel={() => setShowImagePicker(false)}
          />
        </div>
      )}

      <div className="flex gap-2.5 px-4 py-3 border-t border-gray-100 bg-white">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowImagePicker(!showImagePicker)}
          disabled={isSending}
          className="shrink-0"
        >
          📷
        </Button>
        <Input
          ref={inputRef}
          className="flex-1"
          placeholder="输入消息..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isSending}
        />
        <Button
          onClick={handleSend}
          disabled={!inputValue.trim() || isSending}
        >
          发送
        </Button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useFriends } from '../context/FriendContext';
import { useChat } from '../context/ChatContext';
import { type Friend, type FriendRequest } from '../types';
import './ContactsPage.css';

interface ContactsPageProps {
  onChatClick?: (friendId: number) => void;
}

export function ContactsPage({ onChatClick }: ContactsPageProps = {}) {
  const { friends, pendingRequests, acceptFriendRequest, rejectFriendRequest, removeFriend } = useFriends();
  const { setCurrentChatUserId } = useChat();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');

  const handleChatClick = (friendId: number) => {
    setCurrentChatUserId(friendId);
    onChatClick?.(friendId);
  };

  return (
    <div className="contacts-page">
      <div className="contacts-header">
        <h2>通讯录</h2>
        <span className="friend-count">{friends.length} 位好友</span>
      </div>

      <div className="contacts-tabs">
        <button
          className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          好友列表
        </button>
        <button
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          新消息
          {pendingRequests.length > 0 && (
            <span className="badge">{pendingRequests.length}</span>
          )}
        </button>
      </div>

      <div className="contacts-list">
        {activeTab === 'friends' ? (
          friends.length === 0 ? (
            <div className="empty-state">
              <p>还没有好友，去添加一些吧！</p>
            </div>
          ) : (
            friends.map((friend) => (
              <FriendItem
                key={friend.id}
                friend={friend}
                onChat={() => handleChatClick(friend.id)}
                onRemove={() => removeFriend(friend.id)}
              />
            ))
          )
        ) : (
          pendingRequests.length === 0 ? (
            <div className="empty-state">
              <p>没有新的好友请求</p>
            </div>
          ) : (
            pendingRequests.map((request) => (
              <FriendRequestItem
                key={request.id}
                request={request}
                onAccept={() => acceptFriendRequest(request.id)}
                onReject={() => rejectFriendRequest(request.id)}
              />
            ))
          )
        )}
      </div>
    </div>
  );
}

interface FriendItemProps {
  friend: Friend;
  onChat: () => void;
  onRemove: () => void;
}

function FriendItem({ friend, onChat, onRemove }: FriendItemProps) {
  return (
    <div className="contact-item">
      <div className="avatar">
        {friend.avatarUrl ? (
          <img src={friend.avatarUrl} alt={friend.username} />
        ) : (
          <div className="avatar-placeholder">
            {friend.username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="contact-info">
        <span className="username">{friend.username}</span>
        <span className="status">已添加好友</span>
      </div>
      <div className="contact-actions">
        <button className="action-btn chat" onClick={onChat}>
          发消息
        </button>
        <button className="action-btn remove" onClick={onRemove}>
          删除
        </button>
      </div>
    </div>
  );
}

interface FriendRequestItemProps {
  request: FriendRequest;
  onAccept: () => void;
  onReject: () => void;
}

function FriendRequestItem({
  request,
  onAccept,
  onReject,
}: FriendRequestItemProps) {
  return (
    <div className="contact-item request">
      <div className="avatar">
        {request.avatarUrl ? (
          <img src={request.avatarUrl} alt={request.username} />
        ) : (
          <div className="avatar-placeholder">
            {request.username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="contact-info">
        <span className="username">{request.username}</span>
        <span className="time">{new Date(request.createdAt).toLocaleDateString()}</span>
      </div>
      <div className="request-actions">
        <button className="action-btn accept" onClick={onAccept}>
          接受
        </button>
        <button className="action-btn reject" onClick={onReject}>
          拒绝
        </button>
      </div>
    </div>
  );
}

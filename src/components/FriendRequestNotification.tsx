import { useEffect, useState } from 'react';
import { useFriends } from '../context/FriendContext';
import { type FriendRequest } from '../types';
import './FriendRequestNotification.css';

export function FriendRequestNotification() {
  const { pendingRequests, acceptFriendRequest, rejectFriendRequest } = useFriends();
  const [visibleRequests, setVisibleRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
    // Only show the most recent 3 requests
    setVisibleRequests(pendingRequests.slice(0, 3));
  }, [pendingRequests]);

  if (visibleRequests.length === 0) return null;

  return (
    <div className="friend-request-notification">
      <div className="notification-header">
        <span>好友请求</span>
        <span className="count">{pendingRequests.length}</span>
      </div>
      <div className="notification-list">
        {visibleRequests.map((request) => (
          <div key={request.id} className="notification-item">
            <div className="avatar">
              {request.avatarUrl ? (
                <img src={request.avatarUrl} alt={request.username} />
              ) : (
                <div className="avatar-placeholder">
                  {request.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="request-info">
              <span className="username">{request.username}</span>
              <span className="time">
                {new Date(request.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="request-actions">
              <button
                className="accept-btn"
                onClick={() => acceptFriendRequest(request.id)}
                title="接受"
              >
                ✓
              </button>
              <button
                className="reject-btn"
                onClick={() => rejectFriendRequest(request.id)}
                title="拒绝"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        {pendingRequests.length > 3 && (
          <div className="more-requests">
            还有 {pendingRequests.length - 3} 个请求...
          </div>
        )}
      </div>
    </div>
  );
}

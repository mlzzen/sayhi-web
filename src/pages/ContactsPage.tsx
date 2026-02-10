import { useState } from 'react';
import { useFriends } from '../context/FriendContext';
import { useChat } from '../context/ChatContext';
import { type Friend, type FriendRequest } from '../types';
import { Avatar } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

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
    <div className="p-5 max-w-lg mx-auto h-full overflow-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold">通讯录</h2>
        <span className="text-sm text-gray-500">{friends.length} 位好友</span>
      </div>

      <div className="flex gap-2 mb-5 border-b border-gray-100 pb-3">
        <button
          className={`px-4 py-2 text-sm rounded-full flex items-center gap-1 transition-colors ${
            activeTab === 'friends'
              ? 'bg-primary-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('friends')}
        >
          好友列表
        </button>
        <button
          className={`px-4 py-2 text-sm rounded-full flex items-center gap-1 transition-colors ${
            activeTab === 'requests'
              ? 'bg-primary-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('requests')}
        >
          新消息
          {pendingRequests.length > 0 && (
            <Badge variant="destructive" className="px-2 py-0.5 text-xs">
              {pendingRequests.length}
            </Badge>
          )}
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {activeTab === 'friends' ? (
          friends.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
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
            <div className="text-center py-10 text-gray-500">
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
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <Avatar
        src={friend.avatarUrl}
        alt={friend.username}
        fallback={friend.username.charAt(0).toUpperCase()}
      />
      <div className="flex-1 min-w-0">
        <span className="font-medium block truncate">{friend.username}</span>
        <span className="text-xs text-green-600">已添加好友</span>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button size="sm" onClick={onChat}>
          发消息
        </Button>
        <Button size="sm" variant="destructive" onClick={onRemove}>
          删除
        </Button>
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
    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
      <Avatar
        src={request.avatarUrl}
        alt={request.username}
        fallback={request.username.charAt(0).toUpperCase()}
      />
      <div className="flex-1 min-w-0">
        <span className="font-medium block truncate">{request.username}</span>
        <span className="text-xs text-gray-500">
          {new Date(request.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button size="sm" variant="success" onClick={onAccept}>
          接受
        </Button>
        <Button size="sm" variant="destructive" onClick={onReject}>
          拒绝
        </Button>
      </div>
    </div>
  );
}

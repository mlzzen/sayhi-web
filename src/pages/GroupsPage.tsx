import { useState } from 'react';
import { useGroups } from '../context/GroupContext';
import { useFriends } from '../context/FriendContext';
import { Avatar } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { type Group, type Friend } from '../types';

interface GroupsPageProps {
  onOpenGroupChat: (group: Group) => void;
}

export function GroupsPage({ onOpenGroupChat }: GroupsPageProps) {
  const { groups, createGroup, isLoading } = useGroups();
  const { friends } = useFriends();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([]);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;

    try {
      const group = await createGroup(
        groupName.trim(),
        groupDescription.trim() || undefined,
        selectedFriendIds.length > 0 ? selectedFriendIds : undefined
      );
      setShowCreateModal(false);
      setGroupName('');
      setGroupDescription('');
      setSelectedFriendIds([]);
      onOpenGroupChat(group);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const toggleFriendSelection = (friendId: number) => {
    setSelectedFriendIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">群聊</h2>
          <Button onClick={() => setShowCreateModal(true)}>
            创建群聊
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {groups.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>暂无群聊</p>
            <p className="text-sm mt-1">创建一个群聊与好友们一起聊天吧！</p>
            <Button className="mt-4" variant="outline" onClick={() => setShowCreateModal(true)}>
              创建群聊
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {groups.map((group) => (
              <Card
                key={group.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onOpenGroupChat(group)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar
                    src={group.avatarUrl}
                    alt={group.name}
                    fallback={group.name.charAt(0).toUpperCase()}
                    className="h-12 w-12"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{group.name}</span>
                      <span className="text-xs text-gray-500">{group.memberCount} 人</span>
                    </div>
                    {group.description && (
                      <p className="text-sm text-gray-500 truncate mt-0.5">
                        {group.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      群主: {group.ownerUsername}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>创建群聊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">群名称</label>
                <Input
                  placeholder="输入群名称"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">群描述（可选）</label>
                <Input
                  placeholder="输入群描述"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  选择好友加入（可选）
                </label>
                {friends.length === 0 ? (
                  <p className="text-sm text-gray-400">暂无好友，请先添加好友</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                    {friends.map((friend) => (
                      <label
                        key={friend.id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFriendIds.includes(friend.id)}
                          onChange={() => toggleFriendSelection(friend.id)}
                          className="rounded border-gray-300"
                        />
                        <Avatar
                          src={friend.avatarUrl}
                          alt={friend.username}
                          fallback={friend.username.charAt(0).toUpperCase()}
                          className="h-6 w-6"
                        />
                        <span className="text-sm">{friend.username}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setGroupName('');
                    setGroupDescription('');
                    setSelectedFriendIds([]);
                  }}
                >
                  取消
                </Button>
                <Button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || isLoading}
                >
                  {isLoading ? '创建中...' : '创建'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

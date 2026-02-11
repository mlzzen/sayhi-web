import { useState, type ChangeEvent } from 'react';
import { Avatar } from './ui/avatar';
import { userApi } from '../services/api';
import { fileApi } from '../services/api';

interface AvatarUploadProps {
  avatarUrl: string | null | undefined;
  username: string;
  onAvatarUpdate: (newAvatarUrl: string) => void;
}

export function AvatarUpload({ avatarUrl, username, onAvatarUpdate }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const fileInputRef = useState<HTMLInputElement | null>(null)[1]; // Just to get ref type

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { url } = await fileApi.upload(file);
      await userApi.updateProfile({ avatarUrl: url });
      onAvatarUpdate(url);
      setShowUploadMenu(false);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploading(true);
    try {
      await userApi.updateProfile({ avatarUrl: '' });
      onAvatarUpdate('');
      setShowUploadMenu(false);
    } catch (error) {
      console.error('Failed to remove avatar:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="avatar-upload"
        disabled={isUploading}
      />

      <div
        className="relative cursor-pointer group"
        onClick={() => setShowUploadMenu(!showUploadMenu)}
      >
        <Avatar
          src={avatarUrl || undefined}
          alt={username}
          fallback={username.charAt(0).toUpperCase()}
          className="h-10 w-10 ring-2 ring-offset-2 ring-gray-200 group-hover:ring-primary-500 transition-all"
        />
        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-xs">编辑</span>
        </div>
      </div>

      {showUploadMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowUploadMenu(false)}
          />
          <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[120px]">
            <label
              htmlFor="avatar-upload"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              {isUploading ? '上传中...' : '上传新头像'}
            </label>
            {avatarUrl && (
              <button
                onClick={handleRemoveAvatar}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                移除头像
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

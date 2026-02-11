import { useState, useRef, type ChangeEvent } from 'react';
import { Button } from './ui/button';

interface ImagePickerProps {
  onImageSelect: (file: File) => void;
  onCancel?: () => void;
  accept?: string;
}

export function ImagePicker({
  onImageSelect,
  onCancel,
  accept = 'image/*',
}: ImagePickerProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
  };

  const handleConfirm = () => {
    if (selectedFile) {
      onImageSelect(selectedFile);
      reset();
    }
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  const reset = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="max-w-full max-h-64 rounded-lg object-contain"
          />
          <button
            onClick={reset}
            className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-black/70"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 hover:bg-gray-50 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="text-gray-500">
            <p>点击选择图片</p>
            <p className="text-xs mt-1">支持 JPG, PNG, GIF, WebP</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        {preview && (
          <>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              取消
            </Button>
            <Button size="sm" onClick={handleConfirm}>
              发送
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

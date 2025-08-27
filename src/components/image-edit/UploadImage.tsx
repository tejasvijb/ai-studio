import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ZoomIn } from 'lucide-react';




export default function UploadImage({
  selectedImage,
  previewUrl,
  handleDrop,
  handleDragOver,
  handleImageSelect,
  fileInputRef,
  openImageModal
}: {
  selectedImage: File | null;
  previewUrl: string | null;
  handleDrop: (event: React.DragEvent) => void;
  handleDragOver: (event: React.DragEvent) => void;
  handleImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  openImageModal: (imageSrc: string, alt: string) => void;
}) {



  return (

    <div
      className={`border-2 cursor-pointer border-dashed rounded-xl p-8 text-center transition-colors ${selectedImage
        ? 'border-green-300 bg-green-50'
        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {previewUrl ? (
        <div className="space-y-4">
          <div className="relative w-56 h-72 mx-auto group cursor-pointer">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="rounded-lg object-cover"
            />
            {/* Hover overlay with zoom icon */}
            <div
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center"
              onClick={() => openImageModal(previewUrl, 'Image Preview')}
            >
              <ZoomIn className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              {selectedImage?.name}
            </p>
            <p className="text-xs text-gray-400">
              {selectedImage &&
                `Size: ${(selectedImage.size / (1024 * 1024)).toFixed(2)} MB`}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              Drop your image here
            </p>
            <p className="text-gray-500">or click to browse</p>
            <p className="text-xs text-gray-400 mt-2">
              Max size: 10MB. Large images will be resized to 1920px.
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
        className="mt-4"
      >
        Choose File
      </Button>
    </div>
  )
}
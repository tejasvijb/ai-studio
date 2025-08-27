import { ZoomIn } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";


export default function ResultImage({
  resultImage,
  openImageModal,
  isLoading,
  style,
  prompt,
  createdAt,
  history,
  setResultFromHistory
}: {
  resultImage: string;
  openImageModal: (imageSrc: string, alt: string) => void;
  isLoading: boolean;
  style: string;
  prompt: string;
  createdAt: number;
  history: Array<{
    image: string;
    style: string;
    prompt: string;
    createdAt: number;
  }>;
  setResultFromHistory: (historyItem: {
    image: string;
    style: string;
    prompt: string;
    createdAt: number;
  }) => void;
}) {

  console.log(history)
  return (
    <div className="min-h-96 flex flex-col items-center justify-center ">
      {resultImage ? (
        <div className="space-y-4">
          <div className="relative w-56 h-72 mx-auto group cursor-pointer">
            <Image
              src={resultImage}
              alt="AI Enhanced Result"
              fill
              className="rounded-lg object-cover shadow-lg"
            />
            {/* Hover overlay with zoom icon */}
            <div
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center"
              onClick={() => openImageModal(resultImage, 'AI Enhanced Result')}
            >
              <ZoomIn className="w-12 h-12 text-white" />
            </div>
          </div>

          <div className="text-center">
            <Button
              asChild
              className="bg-green-600 hover:bg-green-700"
            >
              <a
                href={resultImage}
                download="ai-enhanced-image.png"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Result
              </a>
            </Button>
          </div>

          {/* Image Details */}

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Style: {style}
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Prompt: {prompt}
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Created At: {new Date(createdAt).toLocaleString()}
            </p>
          </div>

        </div>
      ) : isLoading ? (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">AI is working its magic...</p>
        </div>
      ) : (
        <div className="text-center text-gray-500">
          <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p>Your enhanced image will appear here</p>
        </div>
      )}


      {/* History Section */}
      {history.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">Previous Generations</h4>
          <div className="flex gap-2 justify-center overflow-x-auto pb-2" id="history-container">
            {history.map((item, index) => (
              <div
                key={index}
                className="relative w-16 h-20 group cursor-pointer flex-shrink-0 history-item"
                onClick={() => setResultFromHistory(item)}
              >
                <Image
                  src={item.image}
                  alt={`Previous result ${index + 1}`}
                  fill
                  className="rounded-lg object-cover shadow-md hover:shadow-lg transition-shadow"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-white font-medium">View</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
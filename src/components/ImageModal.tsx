import { downloadImage, generateImageFileName, triggerImageDownload } from "@/lib/utils/imageHandling";

interface ImageModalProps {
  selectedImage: { url: string; path: string } | null;
  setSelectedImage: (image: { url: string; path: string } | null) => void;
}

/**
 * ImageModal component - Displays a full-screen modal for viewing receipt images
 * @param selectedImage - Currently selected image object
 * @param setSelectedImage - Function to clear selected image
 */
export default function ImageModal({ selectedImage, setSelectedImage }: ImageModalProps) {
  if (!selectedImage) return null;

  const handleDownload = async () => {
    const { data } = await downloadImage(selectedImage.path);
    if (data) {
      triggerImageDownload(data, generateImageFileName(selectedImage.path));
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <h3 className="text-white font-medium">Receipt Image</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleDownload}
            className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded text-sm hover:from-purple-600 hover:to-blue-700 transition-colors"
          >
            Download
          </button>
          <button onClick={() => setSelectedImage(null)} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      {/* Image Container */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <img
          src={selectedImage.url}
          alt="Receipt"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
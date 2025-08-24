import { DashboardReceipt } from "@/lib/utils/dataFetching";
import Link from "next/link";
import { getCachedOrFetchImageUrl } from "@/lib/utils/imageHandling";

interface ReceiptsListProps {
  receipts: DashboardReceipt[];
  signedUrls: Record<string, string>;
  setSignedUrls: (urls: Record<string, string>) => void;
  setSelectedImage: (image: { url: string; path: string } | null) => void;
}

/**
 * ReceiptsList component - Displays a list of receipts with thumbnails and actions
 * @param receipts - Array of receipt objects
 * @param signedUrls - Cache of signed URLs for images
 * @param setSignedUrls - Function to update signed URLs cache
 * @param setSelectedImage - Function to set selected image for modal
 */
export default function ReceiptsList({
  receipts,
  signedUrls,
  setSelectedImage
}: ReceiptsListProps) {
  const handleImageClick = async (e: React.MouseEvent, receipt: DashboardReceipt) => {
    e.preventDefault();
    if (!receipt.image_path) return;

    const { url } = await getCachedOrFetchImageUrl(receipt.image_path, signedUrls);
    if (url) {
      setSelectedImage({ url, path: receipt.image_path });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <h2 className="text-2xl font-bold">Past transactions</h2>
          <span className="bg-white/10 text-gray-200 px-3 py-1 rounded-full text-sm font-medium">
            {receipts.length}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-3 py-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-white/20 text-sm">
            Drafts
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent text-white px-4 py-2 pl-10 rounded-lg border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 w-full md:w-64"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Receipts List */}
      <div className="space-y-4">
        {receipts.map((receipt) => (
          <Link
            key={receipt.id}
            href={`/receipt/${receipt.id}/edit`}
            className="block rounded-2xl p-4 bg-indigo-950/60 border border-white/10 hover:border-white/20 hover:bg-indigo-900/40 transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center overflow-hidden">
                  {receipt.image_path ? (
                    signedUrls[receipt.image_path] ? (
                      <img
                        src={signedUrls[receipt.image_path]}
                        alt="Receipt"
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={(e) => handleImageClick(e, receipt)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                        </svg>
                      </div>
                    )
                  ) : (
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-white">{receipt.title || "Untitled Receipt"}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                    <span className="text-sm text-gray-400">4</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-white">
                  ${receipt.total_amount || 64.27}
                </div>
                <div className="text-sm text-gray-400">{new Date(receipt.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </Link>
        ))}

        {receipts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-400 text-lg">No receipts yet</p>
            <p className="text-gray-500 text-sm mt-2">Upload your first bill to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
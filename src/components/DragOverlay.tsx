interface DragOverlayProps {
  isDragActive: boolean;
}

/**
 * DragOverlay component - Shows overlay when files are being dragged over the page
 * @param isDragActive - Whether drag is currently active
 */
export default function DragOverlay({ isDragActive }: DragOverlayProps) {
  if (!isDragActive) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="relative">
        <div className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 opacity-40 blur-2xl animate-pulse"></div>
        <div className="relative px-8 py-6 rounded-2xl border-gradient-purple-pink-orange bg-black/70 text-center shadow-2xl">
          <svg className="w-10 h-10 text-white mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6H16a4 4 0 010 8h-1m-4-4v8m0 0l-3-3m3 3l3-3" />
          </svg>
          <p className="text-xl font-semibold text-white">Drop to upload</p>
          <p className="text-sm text-gray-300 mt-1">We&apos;ll create a new receipt automatically</p>
        </div>
      </div>
    </div>
  );
}
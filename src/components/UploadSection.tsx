"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { uploadFile } from "@/lib/utils/fileUpload";
import { useRef } from "react";

interface UploadSectionProps {
  userId: string;
  router: AppRouterInstance;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
  isDragActive: boolean;
}

/**
 * UploadSection component - Handles file upload with drag-and-drop and click functionality
 * @param userId - Current user ID
 * @param router - Next.js router instance
 * @param uploading - Upload state
 * @param setUploading - Function to set upload state
 * @param isDragActive - Drag active state
 */
export default function UploadSection({
  userId,
  router,
  uploading,
  setUploading,
  isDragActive
}: UploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileButtonClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadFile(file, userId, router);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-3xl mx-auto mb-12">
      <div className={`relative rounded-3xl p-8 md:p-12 text-center min-h-[240px] transition-all ${isDragActive ? "ring-2 ring-purple-500/60 shadow-[0_0_60px_10px_rgba(168,85,247,0.25)]" : ""}`}>
        {/* Gradient background with dashed border effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 opacity-20"></div>
        <div className="absolute inset-0 rounded-3xl border-dashed-gradient-purple-pink-orange"></div>
        <div className="absolute inset-[2px] rounded-3xl bg-black"></div>

        <div className="relative z-10 p-4 md:p-8 flex flex-col items-center justify-center">
          <div className="w-16 h-16 mb-6 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-lg text-white mb-1">Got a bill? Toss it in here.</p>
          <p className="text-sm text-gray-300 mb-6">Drag and drop or click to upload—we&apos;ll do the heavy lifting.</p>

          <button
            onClick={handleFileButtonClick}
            disabled={uploading}
            className="group relative inline-flex items-center justify-center rounded-full p-[2px] focus:outline-none"
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 opacity-80 blur-sm group-hover:opacity-100 transition"></span>
            <span className="relative rounded-full bg-black px-5 py-2 text-sm font-medium text-white border border-white/10">
              {uploading ? "Uploading..." : "Upload Your Bill"}
            </span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>
      </div>
    </div>
  );
}
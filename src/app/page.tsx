"use client";

import { DashboardReceipt, fetchUserReceipts } from "@/lib/utils/dataFetching";
import { useEffect, useRef, useState } from "react";

import DashboardHeader from "@/components/DashboardHeader";
import DragOverlay from "@/components/DragOverlay";
import HeroSection from "@/components/HeroSection";
import ImageModal from "@/components/ImageModal";
import ReceiptsList from "@/components/ReceiptsList";
import UploadSection from "@/components/UploadSection";
import { User } from '@supabase/supabase-js';
import { checkUserAuthentication } from "@/lib/utils/auth";
import { uploadFile } from "@/lib/utils/fileUpload";
import { useRouter } from "next/navigation";

export default function Home() {
  const [receipts, setReceipts] = useState<DashboardReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ url: string; path: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const dragCounter = useRef(0);
  const router = useRouter();
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      // Check if user is authenticated
      const { user, error } = await checkUserAuthentication();

      if (error || !user) {
        // User is not authenticated, redirect to login
        router.push("/login");
        return;
      }

      setUser(user);

      // User is authenticated, fetch receipts with image paths
      const { receipts: userReceipts, signedUrls: urls } = await fetchUserReceipts();
      setReceipts(userReceipts);
      setSignedUrls(urls);

      setLoading(false);
    })();
  }, [router]);

 // Global file drag-and-drop overlay + handlers
 useEffect(() => {
   function hasFiles(e: DragEvent) {
     return Array.from(e.dataTransfer?.types || []).includes("Files");
   }
   const onDragOver = (e: DragEvent) => {
     if (hasFiles(e)) {
       e.preventDefault();
     }
   };
   const onDragEnter = (e: DragEvent) => {
     if (!hasFiles(e)) return;
     e.preventDefault();
     dragCounter.current += 1;
     setIsDragActive(true);
   };
   const onDragLeave = (e: DragEvent) => {
     if (!hasFiles(e)) return;
     dragCounter.current -= 1;
     if (dragCounter.current <= 0) {
       setIsDragActive(false);
     }
   };
   const onDrop = async (e: DragEvent) => {
     if (!hasFiles(e)) return;
     e.preventDefault();
     setIsDragActive(false);
     dragCounter.current = 0;
     const file = e.dataTransfer?.files?.[0];
     if (file && user) {
       setUploading(true);
       try {
         await uploadFile(file, user.id, router);
       } catch (error) {
         console.error("Upload error:", error);
       } finally {
         setUploading(false);
       }
     }
   };

   window.addEventListener("dragover", onDragOver);
   window.addEventListener("dragenter", onDragEnter);
   window.addEventListener("dragleave", onDragLeave);
   window.addEventListener("drop", onDrop);
   return () => {
     window.removeEventListener("dragover", onDragOver);
     window.removeEventListener("dragenter", onDragEnter);
     window.removeEventListener("dragleave", onDragLeave);
     window.removeEventListener("drop", onDrop);
   };
 }, []);


  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-black text-white">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-72 w-72 rounded-full bg-purple-700/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-80 w-80 rounded-full bg-blue-700/30 blur-3xl" />
      </div>

      {/* Header */}
      {user && <DashboardHeader user={user} router={router} />}

      {/* Main Content */}
      <main className="relative z-10 px-4 md:px-8 pb-12">
        <HeroSection />

        {user && (
          <UploadSection
            userId={user.id}
            router={router}
            uploading={uploading}
            setUploading={setUploading}
            isDragActive={isDragActive}
          />
        )}

        <ReceiptsList
          receipts={receipts}
          signedUrls={signedUrls}
          setSignedUrls={setSignedUrls}
          setSelectedImage={setSelectedImage}
        />
      </main>

      <DragOverlay isDragActive={isDragActive} />

      <ImageModal
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
    </div>
  );
}

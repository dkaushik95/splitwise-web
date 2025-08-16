"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { getSupabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type DashboardReceipt = {
  id: string;
  title: string | null;
  created_at: string;
  total_amount?: number;
  participant_count?: number;
  image_path?: string;
};

export default function Home() {
  const [receipts, setReceipts] = useState<DashboardReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ user_metadata?: { full_name?: string } } | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; path: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const dragCounter = useRef(0);
  const router = useRouter();
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const supabase = getSupabase();

      // Check if user is authenticated
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        // User is not authenticated, redirect to login
        router.push("/login");
        return;
      }

      setUser(user);

      // User is authenticated, fetch receipts with image paths
      const { data } = await supabase
        .from("receipts")
        .select("id,title,created_at,image_path,total")
        .order("created_at", { ascending: false });

      const list = (data as DashboardReceipt[]) || [];
      setReceipts(list);

      // Preload signed URLs for thumbnails
      const paths = list.map((r) => r.image_path).filter(Boolean) as string[];
      if (paths.length) {
        const entries = await Promise.all(
          paths.map(async (p) => {
            const res = await supabase.storage.from("receipts").createSignedUrl(p, 60 * 60);
            return [p, res.data?.signedUrl || ""] as const;
          })
        );
        setSignedUrls(Object.fromEntries(entries.filter(([_, url]) => !!url)));
      }

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
     if (file) {
       await uploadFile(file);
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

  const handleSignOut = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const getImageUrl = async (imagePath: string) => {
    const supabase = getSupabase();
    const imagePathRes = await supabase.storage.from('receipts').createSignedUrl(imagePath, 60*60)

    return imagePathRes.data?.signedUrl || "";
  };

  // Mirrors logic from /receipt/new page; used after local file upload
  const handleUploaded = async (imagePath: string) => {
    const supabase = getSupabase();
    const { data: authData } = await supabase.auth.getUser();
    const authedUser = authData?.user;

    if (!authedUser) {
      router.push("/login");
      return;
    }

    // Create receipt row
    const { data: receipt, error } = await supabase
      .from("receipts")
      .insert([{ owner_id: authedUser.id, image_path: imagePath, title: "New receipt" }])
      .select()
      .single();

    if (error || !receipt) {
      console.error("Failed to create receipt:", error);
      return;
    }

    // Fire-and-forget edge function to extract items
    fetch("/functions/v1/extract-receipt-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiptId: receipt.id, imagePath }),
    }).catch(console.error);

    // Navigate to edit page
    router.push(`/receipt/${receipt.id}/edit`);
  };

  const downloadImage = async (imagePath: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.storage.from("receipts").download(imagePath);
    if (error) {
      console.error("Error downloading image:", error);
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = imagePath.split("/").pop() || "receipt.jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // New: inline button to open hidden file input
  const handleFileButtonClick = () => fileInputRef.current?.click();

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const supabase = getSupabase();
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Not signed in");
      const path = `receipts/${user.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("receipts").upload(path, file, { upsert: false });
      if (error) throw error;
      await handleUploaded(path);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
      <header className="relative z-50 px-4 md:px-8 py-5">
        <div className="flex justify-between items-center">
          {/* Left: triple logo marks */}
          <div className="flex items-center gap-4">
            <span className="text-xl font-semibold bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
              fork
            </span>
            <span className="text-xl font-semibold bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
              fork
            </span>
            <span className="text-xl font-semibold px-2 py-0.5 rounded-md bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-black">
              fork
            </span>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <span className="hidden md:block text-sm">{user?.user_metadata?.full_name || "User"}</span>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
              >
                {user?.user_metadata?.full_name?.charAt(0) || "U"}
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg border border-gray-700 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      Account
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleSignOut();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 md:px-8 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white leading-tight">
            Split happens — we’re here for it.
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light">
            Everything you need to manage your receipts is right here.
          </p>
        </div>

        {/* Upload Section */}
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
              <p className="text-sm text-gray-300 mb-6">Drag and drop or click to upload—we’ll do the heavy lifting.</p>

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

        {/* Past Transactions Section */}
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
                            onClick={async (e) => {
                              e.preventDefault();
                              const url = signedUrls[receipt.image_path!] || (await getImageUrl(receipt.image_path!));
                              setSelectedImage({ url, path: receipt.image_path! });
                            }}
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
      </main>

      {isDragActive && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 opacity-40 blur-2xl animate-pulse"></div>
            <div className="relative px-8 py-6 rounded-2xl border-gradient-purple-pink-orange bg-black/70 text-center shadow-2xl">
              <svg className="w-10 h-10 text-white mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6H16a4 4 0 010 8h-1m-4-4v8m0 0l-3-3m3 3l3-3" />
              </svg>
              <p className="text-xl font-semibold text-white">Drop to upload</p>
              <p className="text-sm text-gray-300 mt-1">We’ll create a new receipt automatically</p>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-white font-medium">Receipt Image</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => downloadImage(selectedImage.path)}
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
            <div className="p-4">
              <img src={selectedImage.url} alt="Receipt" className="max-w-full max-h-[70vh] object-contain rounded" />
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showUserMenu && <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />}
    </div>
  );
}

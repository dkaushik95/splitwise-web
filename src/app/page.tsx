"use client";

import { useEffect, useState } from "react";

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
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const supabase = getSupabase();
      
      // Check if user is authenticated
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        // User is not authenticated, redirect to login
        router.push('/login');
        return;
      }

      setUser(user);

      // User is authenticated, fetch receipts with image paths
      const { data } = await supabase
        .from("receipts")
        .select("id,title,created_at,image_path,total")
        .order("created_at", { ascending: false });
      setReceipts((data as DashboardReceipt[]) || []);
      setLoading(false);
    })();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getImageUrl = (imagePath: string) => {
    const supabase = getSupabase();
    return supabase.storage.from('receipts').getPublicUrl(imagePath).data.publicUrl;
  };

  const downloadImage = async (imagePath: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.storage.from('receipts').download(imagePath);
    if (error) {
      console.error('Error downloading image:', error);
      return;
    }
    
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = imagePath.split('/').pop() || 'receipt.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="px-4 py-6 md:px-8">
        <div className="flex justify-between items-center">
          {/* Logo - Single instance with gradient background */}
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-600 px-3 py-1 rounded-lg">
            fork
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <span className="hidden md:block text-sm">{user?.user_metadata?.full_name || 'User'}</span>
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
              >
                {user?.user_metadata?.full_name?.charAt(0) || 'U'}
              </button>
              
              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg border border-gray-700 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // TODO: Navigate to account settings
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
      <main className="px-4 md:px-8 pb-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white leading-tight">
            Split happens — we&apos;re here for it.
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light">
            Everything you need to manage your receipts is right here.
          </p>
        </div>

        {/* Upload Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="border-2 border-dashed border-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-8 md:p-12 text-center bg-gradient-to-br from-gray-900/30 to-gray-800/30 backdrop-blur-sm relative overflow-hidden">
            {/* Gradient background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-600/5"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-lg text-gray-300 mb-6">
                Got a bill? Toss it in here. Drag and drop or click to upload—we&apos;ll do the heavy lifting.
              </p>
              <Link 
                href="/receipt/new"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Upload Your Bill
              </Link>
            </div>
          </div>
        </div>

        {/* Past Transactions Section */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <h2 className="text-2xl font-bold">Past transactions</h2>
              <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
                {receipts.length}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-white transition-colors text-sm">
                Drafts
              </button>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="bg-gray-800 text-white px-4 py-2 pl-10 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 w-full md:w-64"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="block bg-gray-900 rounded-xl p-4 hover:bg-gray-800 transition-colors duration-200 border border-gray-800 hover:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                      {receipt.image_path ? (
                        <img
                          src={getImageUrl(receipt.image_path)}
                          alt="Receipt"
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedImage({ url: getImageUrl(receipt.image_path!), path: receipt.image_path! });
                          }}
                        />
                      ) : (
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">
                        {receipt.title || 'Untitled Receipt'}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <span className="text-sm text-gray-400">4</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-white">
                      ${receipt.total_amount || 64.27}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(receipt.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            
            {receipts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg">No receipts yet</p>
                <p className="text-gray-500 text-sm mt-2">Upload your first bill to get started</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
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
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4">
                             <img
                 src={selectedImage.url}
                 alt="Receipt"
                 className="max-w-full max-h-[70vh] object-contain rounded"
               />
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
}

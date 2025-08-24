"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { signOutUser } from "@/lib/utils/auth";
import { useState } from "react";

interface DashboardHeaderProps {
  user: { user_metadata?: { full_name?: string } } | null;
  router: AppRouterInstance;
}

/**
 * DashboardHeader component - Displays the app logo and user menu
 * @param user - Current user object
 * @param router - Next.js router instance for navigation
 */
export default function DashboardHeader({ user, router }: DashboardHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOutUser(router);
  };

  return (
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
  );
}
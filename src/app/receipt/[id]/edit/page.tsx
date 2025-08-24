"use client";

import { useParams, useRouter } from "next/navigation";

import DashboardHeader from "@/components/DashboardHeader";
import { ItemTable } from "@/components/ItemTable";
import { ParticipantsPanel } from "@/components/ParticipantsPanel";
import { PromptAssign } from "@/components/PromptAssign";
import { ShareToggle } from "@/components/ShareToggle";
import { SummaryCard } from "@/components/SummaryCard";
import { useState } from "react";

/**
 * EditReceiptPage - Receipt editing surface
 * Design-first layout approximating the reference image.
 * Functionality is stubbed via local state toggles and TODOs.
 */
export default function EditReceiptPage() {
  const params = useParams<{ id: string }>();
  const receiptId = params.id as string;
  const router = useRouter();

  // UI stubs
  const [showShare, setShowShare] = useState(false);
  const [showPromptAssign, setShowPromptAssign] = useState(false);
  const [isDraft, setIsDraft] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1020] via-[#0a0f1d] to-black text-gray-100">
      {/* Header (reused, unchanged) */}
      <DashboardHeader user={null} router={router} />

      {/* Top utility row */}
      <div className="px-4 md:px-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="group inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80 group-hover:opacity-100">
              <path fill="currentColor" d="M15.41 7.41L14 6l-6 6l6 6l1.41-1.41L10.83 12z" />
            </svg>
            Back to dashboard
          </button>

          <div className="relative">
            <button
              onClick={() => setShowShare((s) => !s)}
              className="rounded-full border border-white/10 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 px-4 py-2 text-sm font-medium text-black shadow-[0_0_0_1px_rgba(255,255,255,0.15)_inset] hover:brightness-110 transition"
            >
              Get Shareable Link
            </button>
            {showShare && (
              <div className="absolute right-0 mt-3 w-[320px] rounded-xl border border-white/10 bg-black/80 backdrop-blur p-4 shadow-xl">
                {/* Functionality stub: share controls popover */}
                <ShareToggle receiptId={receiptId} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="px-4 md:px-8 pb-16">
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
          {/* Left column */}
          <section className="space-y-6">
            {/* Title row */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Costco</h1>
                  <button
                    className="rounded-md border border-white/10 bg-white/5 p-1.5 text-xs text-gray-300 hover:bg-white/10"
                    title="Rename receipt"
                    onClick={() => {
                      // TODO: Implement rename flow
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="m3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1.003 1.003 0 0 0 0-1.42L18.37 3.29a1.003 1.003 0 0 0-1.42 0l-1.83 1.83l3.75 3.75z"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-3">
                  <p className="text-2xl font-semibold">$64.27</p>
                  {isDraft && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-blue-200">
                      Draft
                    </span>
                  )}
                </div>
              </div>

              {/* Receipt thumbnail */}
              <div className="hidden md:block">
                <div className="w-14 h-20 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" className="opacity-80">
                    <path
                      fill="currentColor"
                      d="M17 2H7a2 2 0 0 0-2 2v16l3-2l3 2l3-2l3 2l3-2V4a2 2 0 0 0-2-2m0 14H7v-2h10zm0-4H7v-2h10zm0-4H7V6h10z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Items list + totals container */}
            <div className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur p-2 md:p-3">
              <div className="rounded-xl bg-white/5 p-1">
                {/* The ItemTable renders the actual items. The wrapper provides the pill-list aesthetic. */}
                <ItemTable receiptId={receiptId} />
              </div>

              {/* Totals summary area */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="col-span-2 sm:col-span-4 rounded-xl border border-white/10 bg-white/5 p-4">
                  <SummaryCard receiptId={receiptId} />
                </div>
              </div>
            </div>

            {/* Save indicator */}
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <svg width="14" height="14" viewBox="0 0 24 24" className="text-yellow-300">
                <path fill="currentColor" d="M12 17.27L18.18 21L16.54 13.97L22 9.24l-7.19-.61L12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              Every change you make — we’ll be saving it.
            </div>

            {/* Prompt command bar */}
            <div className="rounded-2xl p-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 shadow-xl">
              <div className="rounded-[14px] bg-black/60 backdrop-blur p-3 md:p-4 flex items-center justify-between">
                <span className="text-gray-300">Tell us who got what.</span>
                <button
                  onClick={() => setShowPromptAssign((s) => !s)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 hover:bg-white/20 transition"
                  title="Open prompt assign"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                  </svg>
                </button>
              </div>
            </div>

            {showPromptAssign && (
              <div className="rounded-xl border border-white/10 bg-black/70 backdrop-blur p-4">
                {/* When expanded, show the actual prompt-assign UI */}
                <PromptAssign receiptId={receiptId} />
              </div>
            )}
          </section>

          {/* Right column */}
          <aside className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-medium">Contributors</h2>
                {/* Stubbed count */}
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-gray-200">5</span>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <ParticipantsPanel receiptId={receiptId} />
            </div>

            {/* Bottom controls */}
            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4">
              <label className="flex items-center gap-3 text-sm text-gray-300">
                <span>Not finished yet? Save as draft.</span>
                <input
                  type="checkbox"
                  checked={isDraft}
                  onChange={(e) => {
                    setIsDraft(e.target.checked);
                    // TODO: Persist draft state to backend
                  }}
                  className="h-5 w-10 appearance-none rounded-full bg-white/10 transition relative
                    before:absolute before:top-0.5 before:left-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white
                    before:transition checked:bg-blue-500 checked:before:translate-x-5"
                />
              </label>

              <button
                onClick={() => {
                  // TODO: Confirm and delete receipt
                }}
                className="text-sm text-red-300 hover:text-red-200"
              >
                Delete transaction
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}



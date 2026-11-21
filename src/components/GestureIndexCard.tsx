"use client";

import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function GestureIndexCard({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const gestures = [
    {
      sign: "🖐️",
      name: "Wave / Swipe Hand",
      action: "Next Garment",
      desc: "Wave or swipe your open hand across the camera to cycle through the catalog and try on the next clothing item in real time.",
      tag: "Catalog Navigation",
    },
    {
      sign: "👍",
      name: "Thumbs-Up",
      action: "Add to Bag",
      desc: "Make a fist with your thumb pointing straight up for 0.2s to add the active garment to your shopping bag.",
      tag: "Shopping Action",
    },
    {
      sign: "👌",
      name: "OK Sign",
      action: "Add to Bag",
      desc: "Pinch your thumb and index finger into a circle with other fingers extended to add the garment to your bag.",
      tag: "Alternate Action",
    },
    {
      sign: "✌️",
      name: "Peace / Point Sign",
      action: "Voice Search",
      desc: "Raise a peace sign or point your index finger up to turn on the microphone. Speak any garment name to find and try it on.",
      tag: "Speech Trigger",
    },
    {
      sign: "📐",
      name: "Body Pose",
      action: "AI Sizing (S/M/L/XL)",
      desc: "Stand in frame with shoulders and torso visible. 33-point computer vision anthropometry calculates your optimal size automatically.",
      tag: "Computer Vision",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-neutral-900 border border-white/10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-sm p-6 sm:p-8 space-y-6 shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mirror frame corner ticks */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white/40" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white/40" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white/40" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white/40" />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="space-y-1">
            <h3 className="text-[12px] font-medium text-white/90 tracking-[0.2em] uppercase">
              Gesture Command Index
            </h3>
            <p className="text-[11px] text-white/40 tracking-wider font-light">
              Touchless Fitting Room Interaction — MediaPipe Vision AI
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/30 hover:text-white transition-colors"
            title="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Gestures List */}
        <div className="divide-y divide-white/5 space-y-3 pt-1">
          {gestures.map((item, idx) => (
            <div key={idx} className="pt-3 first:pt-0 flex items-start gap-4">
              <div className="w-10 h-10 rounded-sm bg-neutral-950 border border-white/10 flex items-center justify-center text-xl flex-shrink-0">
                {item.sign}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-[12px] font-medium text-white tracking-wide">
                    {item.name}
                  </h4>
                  <span className="text-[9px] uppercase tracking-[0.15em] text-white/40 bg-white/5 px-2 py-0.5 rounded-xs">
                    {item.tag}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-white/90 mt-0.5">
                  Action: {item.action}
                </p>
                <p className="text-[11px] text-white/50 font-light mt-0.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-white/10">
          <span className="text-[10px] text-white/40 tracking-wider font-light">
            Tip: You can re-open this anytime via <strong className="text-white/60 font-medium">? Gestures</strong> in the top bar.
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white text-black text-[10px] uppercase tracking-[0.15em] font-medium hover:bg-white/90 transition-colors rounded-sm cursor-pointer"
          >
            Start Try-On
          </button>
        </div>
      </div>
    </div>
  );
}


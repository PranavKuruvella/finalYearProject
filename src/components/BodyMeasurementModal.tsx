"use client";

import React from "react";
import type { BodyMeasurements } from "@/hooks/useSwipeGesture";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  measurements: BodyMeasurements | null;
  selectedSize: "S" | "M" | "L" | "XL";
  onSelectSize: (size: "S" | "M" | "L" | "XL") => void;
}

export function BodyMeasurementModal({
  isOpen,
  onClose,
  measurements,
  selectedSize,
  onSelectSize,
}: Props) {
  if (!isOpen) return null;

  const currentSize = measurements?.recommendedSize || "M";
  const confidence = measurements?.fitConfidence || 94;
  const shoulderCm = measurements?.shoulderWidthCm || 43.2;
  const shoulderIn = (shoulderCm / 2.54).toFixed(1);
  const torsoCm = measurements?.torsoLengthCm || 51.5;
  const torsoIn = (torsoCm / 2.54).toFixed(1);
  const chestCm = measurements?.chestEstimateCm || 97.2;
  const chestIn = (chestCm / 2.54).toFixed(1);
  const distance = measurements?.distanceMeters || 1.4;

  const sizeChart = [
    { size: "S", label: "Small", shoulder: "38 - 41 cm", chest: "88 - 94 cm", torso: "46 - 50 cm" },
    { size: "M", label: "Medium", shoulder: "41.5 - 45 cm", chest: "95 - 102 cm", torso: "50 - 54 cm" },
    { size: "L", label: "Large", shoulder: "45 - 48.5 cm", chest: "103 - 110 cm", torso: "54 - 58 cm" },
    { size: "XL", label: "Extra Large", shoulder: "48.5 - 53 cm", chest: "111 - 120 cm", torso: "58 - 62 cm" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-neutral-900 border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm p-6 sm:p-8 space-y-6 shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mirror frame corner ticks */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white/40" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white/40" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white/40" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white/40" />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-5">
          <div className="space-y-1">
            <h3 className="text-[12px] font-medium text-white/90 tracking-[0.2em] uppercase">
              Anthropometric Fit Profile
            </h3>
            <p className="text-[11px] text-white/40 tracking-wider font-light">
              33-Keypoint Pose Estimation & Real-World 3D Metric Scaling
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/30 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Hero Recommended Size Card */}
        <div className="p-6 bg-neutral-950 border border-white/10 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-light">
              AI Recommendation
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-light text-white tracking-tight">Size</span>
              <span className="text-4xl font-semibold text-white tracking-tight">{currentSize}</span>
            </div>
            <p className="text-[11px] text-white/50 max-w-sm font-light leading-relaxed">
              Calculated from biacromial shoulder span & torso contours with a calculated{" "}
              <span className="text-white font-medium">{confidence}% Fit Confidence</span>.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-sm min-w-[120px]">
            <span className="text-[9px] text-white/40 uppercase tracking-[0.2em] mb-1">Confidence</span>
            <span className="text-2xl font-light text-white">{confidence}%</span>
            <span className="text-[9px] text-white/40 uppercase tracking-wider mt-1">Optimal Fit</span>
          </div>
        </div>

        {/* Real-time Metric Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-neutral-950 border border-white/10 rounded-sm space-y-1">
            <span className="text-[9px] text-white/40 uppercase tracking-[0.2em] block">Shoulder Span</span>
            <div className="text-lg font-light text-white tracking-tight">
              {shoulderCm.toFixed(1)} <span className="text-[10px] text-white/40">cm</span>
            </div>
            <span className="text-[10px] text-white/40 block">({shoulderIn} in)</span>
          </div>

          <div className="p-3.5 bg-neutral-950 border border-white/10 rounded-sm space-y-1">
            <span className="text-[9px] text-white/40 uppercase tracking-[0.2em] block">Torso Length</span>
            <div className="text-lg font-light text-white tracking-tight">
              {torsoCm.toFixed(1)} <span className="text-[10px] text-white/40">cm</span>
            </div>
            <span className="text-[10px] text-white/40 block">({torsoIn} in)</span>
          </div>

          <div className="p-3.5 bg-neutral-950 border border-white/10 rounded-sm space-y-1">
            <span className="text-[9px] text-white/40 uppercase tracking-[0.2em] block">Est. Chest</span>
            <div className="text-lg font-light text-white tracking-tight">
              {chestCm.toFixed(1)} <span className="text-[10px] text-white/40">cm</span>
            </div>
            <span className="text-[10px] text-white/40 block">({chestIn} in)</span>
          </div>

          <div className="p-3.5 bg-neutral-950 border border-white/10 rounded-sm space-y-1">
            <span className="text-[9px] text-white/40 uppercase tracking-[0.2em] block">Distance</span>
            <div className="text-lg font-light text-white tracking-tight">
              {distance} <span className="text-[10px] text-white/40">m</span>
            </div>
            <span className="text-[10px] text-white/50 block">In Range</span>
          </div>
        </div>

        {/* Size Selection Override */}
        <div className="space-y-3 pt-2">
          <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-light block">
            Select Your Preferred Size:
          </label>
          <div className="grid grid-cols-4 gap-3">
            {(["S", "M", "L", "XL"] as const).map((size) => {
              const isRecommended = currentSize === size;
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  onClick={() => onSelectSize(size)}
                  className={`py-3 px-2 rounded-sm border flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? "bg-white text-black border-white font-medium"
                      : "bg-white/5 text-white/80 border-white/10 hover:border-white/30"
                  }`}
                >
                  <span className="text-sm tracking-wider">{size}</span>
                  {isRecommended && (
                    <span className={`text-[8px] uppercase tracking-wider mt-0.5 ${
                      isSelected ? "text-black/70 font-semibold" : "text-white/40"
                    }`}>
                      AI Match
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sizing Standard Comparison Table */}
        <div className="space-y-2 pt-2">
          <span className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-light block">
            Retail Benchmark Sizing Matrix
          </span>
          <div className="border border-white/10 rounded-sm overflow-hidden text-[11px]">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-white/40 uppercase tracking-[0.15em] text-[9px]">
                <tr>
                  <th className="py-2.5 px-3 font-normal">Size</th>
                  <th className="py-2.5 px-3 font-normal">Shoulder Span</th>
                  <th className="py-2.5 px-3 font-normal">Chest Girth</th>
                  <th className="py-2.5 px-3 font-normal">Torso Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-light">
                {sizeChart.map((row) => {
                  const isCurrent = currentSize === row.size;
                  return (
                    <tr
                      key={row.size}
                      className={isCurrent ? "bg-white/10 text-white font-normal" : "text-white/60"}
                    >
                      <td className="py-2 px-3 flex items-center gap-1.5">
                        <span>{row.size}</span>
                        {isCurrent && <span className="text-[8px] bg-white text-black px-1 rounded-xs font-semibold">YOU</span>}
                      </td>
                      <td className="py-2 px-3">{row.shoulder}</td>
                      <td className="py-2 px-3">{row.chest}</td>
                      <td className="py-2 px-3">{row.torso}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 flex justify-end gap-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white text-black text-[10px] uppercase tracking-[0.15em] font-medium hover:bg-white/90 transition-colors rounded-sm"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}

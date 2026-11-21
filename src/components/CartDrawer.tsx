"use client";

import type { Product } from "@/data/catalog";
import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cartIds: string[];
  catalog: Product[];
  currentSize?: string;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onTryOnItem: (product: Product) => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  cartIds,
  catalog,
  currentSize = "M",
  onRemoveItem,
  onClearCart,
  onTryOnItem,
}: Props) {
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const cartProducts = cartIds
    .map((id) => catalog.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  // Realistic mock price calculation based on id/name
  const getItemPrice = (product: Product) => {
    const base = product.type === "polo" ? 68 : 84;
    const num = parseInt(product.id.replace(/\D/g, "") || "1", 10);
    return base + (num % 4) * 6;
  };

  const subtotal = cartProducts.reduce((sum, p) => sum + getItemPrice(p), 0);

  const handleCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCheckoutComplete(true);
    }, 1200);
  };

  const handleFinishCheckout = () => {
    setCheckoutComplete(false);
    onClearCart();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-neutral-950 border-l border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <svg
              className="w-5 h-5 text-white/80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <h2 className="text-[13px] font-semibold text-white uppercase tracking-[0.2em]">
              Shopping Bag
            </h2>
            <span className="text-[11px] text-white/40 tracking-wider">
              ({cartProducts.length})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/40 hover:text-white transition-colors rounded-sm hover:bg-white/5"
            title="Close"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content area */}
        {checkoutComplete ? (
          /* Checkout confirmation view */
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 mb-5">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Order Confirmed!</h3>
            <p className="text-[12px] text-white/50 max-w-xs leading-relaxed mb-6 font-light">
              Your garments have been reserved. In an interactive retail fitting room, a store associate would bring these items directly to your booth.
            </p>
            <div className="p-4 bg-white/5 border border-white/10 rounded w-full max-w-xs text-left mb-8 space-y-1.5">
              <div className="flex justify-between text-[11px] text-white/60">
                <span>Items Ordered:</span>
                <span className="text-white font-medium">{cartProducts.length}</span>
              </div>
              <div className="flex justify-between text-[11px] text-white/60">
                <span>Total Amount:</span>
                <span className="text-white font-medium">${subtotal}.00</span>
              </div>
              <div className="flex justify-between text-[11px] text-white/60">
                <span>Fitting Room:</span>
                <span className="text-white font-medium">Room #3 (Reserved)</span>
              </div>
            </div>
            <button
              onClick={handleFinishCheckout}
              className="px-8 py-3 bg-white text-black text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-white/90 transition-colors w-full max-w-xs"
            >
              Back to Fitting Room
            </button>
          </div>
        ) : cartProducts.length === 0 ? (
          /* Empty state */
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 mb-4">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>
            <p className="text-[13px] text-white font-medium mb-1.5 uppercase tracking-[0.1em]">
              Your Bag is Empty
            </p>
            <p className="text-[11px] text-white/40 max-w-xs leading-relaxed mb-6 font-light">
              Browse garments using the catalog arrows or hand gestures. Give a thumbs-up 👍 or click &quot;Add to Bag&quot; to save items here.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-white/10 text-white text-[11px] uppercase tracking-[0.15em] hover:bg-white/20 transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          /* Products list */
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-white/5">
              {cartProducts.map((product) => {
                const price = getItemPrice(product);
                return (
                  <div key={product.id} className="pt-4 first:pt-0 flex gap-4 items-center">
                    {/* Thumbnail */}
                    <div className="w-16 h-20 bg-neutral-900 border border-white/10 rounded flex-shrink-0 overflow-hidden flex items-center justify-center p-1">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[12px] font-medium text-white truncate">
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">
                        {product.category} • {product.type} • <span className="text-emerald-400 font-medium">Size {currentSize}</span>
                      </p>
                      <p className="text-[12px] font-semibold text-white/90 mt-1.5">
                        ${price}.00
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          onTryOnItem(product);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] uppercase tracking-[0.1em] rounded transition-colors"
                        title="Try this item on now"
                      >
                        Try On
                      </button>
                      <button
                        onClick={() => onRemoveItem(product.id)}
                        className="text-white/30 hover:text-red-400 p-1 transition-colors"
                        title="Remove from bag"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Summary & Checkout */}
            <div className="p-6 border-t border-white/10 bg-neutral-900/60 space-y-4 flex-shrink-0">
              <div className="space-y-1.5 text-[12px]">
                <div className="flex justify-between text-white/50">
                  <span>Subtotal</span>
                  <span className="text-white">${subtotal}.00</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Fitting Room Reservation</span>
                  <span className="text-green-400 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-[13px] font-semibold text-white pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span>${subtotal}.00</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full py-3 bg-white text-black text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2 disabled:bg-white/50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Reserving...
                    </>
                  ) : (
                    "Checkout & Reserve Room"
                  )}
                </button>
                <button
                  onClick={onClearCart}
                  className="w-full py-2 text-[10px] uppercase tracking-[0.15em] text-white/40 hover:text-white/80 transition-colors"
                >
                  Clear Bag
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


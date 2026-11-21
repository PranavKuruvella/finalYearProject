"use client";

interface Props {
  isListening: boolean;
  transcript: string;
  matchedResult?: string | null;
  supported: boolean;
  onToggle: () => void;
}

export function VoiceIndicator({
  isListening,
  transcript,
  matchedResult,
  supported,
  onToggle,
}: Props) {
  if (!supported) {
    return (
      <div className="w-full bg-neutral-950 border-b border-white/10 px-6 py-1.5 flex items-center justify-between text-[10px] text-white/30 tracking-wider">
        <span>VOICE NAVIGATION: Supported in Chromium / Chrome browsers</span>
        <span>GESTURE CONTROL: ACTIVE</span>
      </div>
    );
  }

  const tickerMessage = isListening
    ? "LISTENING LIVE • Speak any product: \"Green knit polo\", \"White t-shirt\", \"Brown contrast\", \"Sky blue\"..."
    : "VOICE CONTROL: Raise ✌️ Peace Sign or Tap Mic to speak • HAND GESTURES: 🖐️ Wave to switch garments • 👍 Thumbs up to add to bag • 📐 Stand in frame for AI Body Sizing";

  return (
    <div className="w-full bg-neutral-950/90 border-b border-white/10 px-6 py-1.5 flex items-center gap-4 text-xs select-none overflow-hidden z-20">
      {/* Mic Status & Blinking Indicator Button */}
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-2.5 py-1 rounded transition-all cursor-pointer flex-shrink-0 border ${
          isListening
            ? "bg-red-500/20 border-red-500/50 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
        }`}
        title={isListening ? "Click to stop listening" : "Click or raise ✌️ to speak"}
      >
        {isListening ? (
          /* Live Blinking Recording Dot + Sound Waves */
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-red-400 animate-pulse">
              LIVE
            </span>
            {/* Animated audio bars */}
            <div className="flex items-center gap-0.5 h-3">
              <span className="w-0.5 h-2 bg-red-400 animate-pulse" style={{ animationDuration: "0.5s" }} />
              <span className="w-0.5 h-3 bg-red-400 animate-pulse" style={{ animationDuration: "0.3s" }} />
              <span className="w-0.5 h-1.5 bg-red-400 animate-pulse" style={{ animationDuration: "0.7s" }} />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            <span className="text-[10px] uppercase tracking-wider text-white/50">
              MIC IDLE
            </span>
          </div>
        )}
      </button>

      {/* When user is actively speaking OR has a recent result: show speech transcript & matched product */}
      {(isListening && transcript) || matchedResult ? (
        <div className="flex-1 flex items-center gap-3 overflow-hidden text-xs">
          {transcript && (
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="text-[10px] uppercase font-semibold text-white/40 tracking-wider flex-shrink-0">
                Heard:
              </span>
              <span className="text-[11px] font-medium text-white truncate bg-white/10 px-2.5 py-0.5 rounded border border-white/20">
                &ldquo;{transcript}&rdquo;
              </span>
            </div>
          )}

          {matchedResult ? (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-white/40">➔</span>
              <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider flex-shrink-0">
                Result:
              </span>
              <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                <span>👕</span>
                <span>{matchedResult}</span>
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-white/40 tracking-wide flex-shrink-0 animate-pulse">
              Searching catalog...
            </span>
          )}
        </div>
      ) : (
        /* Scrolling Ticker Message */
        <div className="flex-1 overflow-hidden relative whitespace-nowrap">
          {/* Subtle fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-neutral-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-neutral-950 to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee flex items-center gap-12 text-[11px] font-light tracking-wide text-white/70">
            <span>{tickerMessage}</span>
            <span className="text-white/30">•</span>
            <span>{tickerMessage}</span>
          </div>
        </div>
      )}

      {/* Quick gesture hint on right */}
      <div className="hidden lg:flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-white/30 flex-shrink-0">
        <span>Trigger: <strong className="text-white/60 font-medium">✌️ Sign</strong> or <strong className="text-white/60 font-medium">Space</strong></span>
      </div>
    </div>
  );
}

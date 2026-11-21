"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechRecognitionHook {
  transcript: string;
  isListening: boolean;
  start: () => void;
  stop: () => void;
  supported: boolean;
}

export function useSpeechRecognition(
  onResult: (text: string) => void
): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    const isSupp =
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    setSupported(Boolean(isSupp));
  }, []);

  const stop = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (typeof window === "undefined") return;
    const isSupp = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
    if (!isSupp) return;

    // Clean up any existing instance first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    let lastSentText = "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let final = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          final += res[0].transcript;
        } else {
          interim += res[0].transcript;
        }
      }

      const text = (final || interim).trim();
      if (text) {
        setTranscript(text);
        // Only trigger if text has meaningfully changed
        if (text.toLowerCase() !== lastSentText.toLowerCase()) {
          lastSentText = text;
          onResultRef.current(text);
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.warn("Speech recognition notice:", event.error);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        isListeningRef.current = false;
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // If we are still supposed to be listening, resume seamlessly
      if (isListeningRef.current && recognitionRef.current) {
        try {
          recognition.start();
        } catch {
          // Restart later if browser needs a moment
          setTimeout(() => {
            if (isListeningRef.current) {
              try {
                recognition.start();
              } catch {
                isListeningRef.current = false;
                setIsListening(false);
              }
            }
          }, 200);
        }
      } else {
        setIsListening(false);
      }
    };

    try {
      recognition.start();
      isListeningRef.current = true;
      setIsListening(true);
      setTranscript("");
      recognitionRef.current = recognition;
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  return { transcript, isListening, start, stop, supported };
}

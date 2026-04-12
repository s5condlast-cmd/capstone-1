"use client";

import { useState, useRef, useEffect } from "react";

interface SpeechToTextProps {
  onTranscript: (text: string) => void;
  isProcessing?: boolean;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResult[];
}

interface SpeechRecognitionError {
  error: string;
}

export default function SpeechToText({ onTranscript, isProcessing = false }: SpeechToTextProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState("");

  const recognitionRef = useRef<Record<string, unknown>>(null);

  useEffect(() => {
    const win = window as unknown as {
      SpeechRecognition?: unknown;
      webkitSpeechRecognition?: unknown;
    };
    const SpeechRecognitionConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      setIsSupported(false);
      setError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: Record<string, unknown> = new (SpeechRecognitionConstructor as any)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setError("");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscriptText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptText += transcriptPart + " ";
        } else {
          interimText += transcriptPart;
        }
      }

      if (finalTranscriptText) {
        setTranscript((prev) => prev + finalTranscriptText);
      }
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event: SpeechRecognitionError) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);

      switch (event.error) {
        case "not-allowed":
          setError("Microphone access denied. Please allow microphone access.");
          break;
        case "no-speech":
          setError("No speech detected. Please try again.");
          break;
        case "network":
          setError("Network error. Please check your connection.");
          break;
        default:
          setError(`Error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (recognitionRef.current as any).abort();
      }
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current || isProcessing) return;
    setTranscript("");
    setInterimTranscript("");
    setError("");
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (recognitionRef.current as any).start();
    } catch (e) {
      console.error("Recognition start error:", e);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (recognitionRef.current as any).stop();
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSend = () => {
    if (transcript.trim()) {
      onTranscript(transcript.trim());
    }
  };

  const handleClear = () => {
    setTranscript("");
    setInterimTranscript("");
    setError("");
  };

  if (!isSupported) {
    return (
      <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
        <p className="text-red-300 text-sm">{error}</p>
        <p className="text-red-400 text-xs mt-2">
          Please use Chrome, Edge, or Safari for speech recognition.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleListening}
          disabled={isProcessing}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isListening
              ? "bg-red-600 hover:bg-red-700 animate-pulse"
              : "bg-blue-600 hover:bg-blue-700"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isListening ? (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>

        <div className="flex-1">
          <p className="text-white font-medium">
            {isListening ? "Listening..." : "Click to start recording"}
          </p>
          <p className="text-slate-400 text-sm">
            {isListening ? "Speak clearly into your microphone" : "Your voice will be transcribed"}
          </p>
        </div>

        {isProcessing && (
          <div className="flex items-center gap-2 text-purple-400">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm">Processing...</span>
          </div>
        )}
      </div>

      {(transcript || interimTranscript || error) && (
        <div className="relative">
          <div className="bg-slate-900 border border-slate-600 rounded-lg p-4 min-h-[100px] max-h-[200px] overflow-y-auto">
            {transcript && (
              <p className="text-white whitespace-pre-wrap">{transcript}</p>
            )}
            {interimTranscript && (
              <p className="text-slate-500 italic whitespace-pre-wrap">{interimTranscript}</p>
            )}
            {error && !transcript && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
          </div>

          {!isListening && transcript && !isProcessing && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleSend}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Send to AI
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {isListening && transcript && (
        <button
          onClick={stopListening}
          className="text-slate-400 hover:text-white text-sm underline"
        >
          Done recording
        </button>
      )}
    </div>
  );
}

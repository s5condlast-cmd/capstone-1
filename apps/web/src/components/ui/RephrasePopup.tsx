"use client";

import React, { useState, useEffect, useMemo } from "react";
import { WordSuggestion } from "@/lib/analyzers/rephrase-analyzer";
import { getUsageStats } from "@/lib/usage-tracker";

interface RephrasePopupProps {
  fieldName: string;
  fieldValue: string;
  isOpen: boolean;
  onClose: () => void;
  onApply: (field: string, newValue: string) => void;
  apiKey: string;
}

interface AnalyzedWord {
  word: string;
  sentence: string;
  suggestions: string[];
  startIndex: number;
  endIndex: number;
  score: number;
}

export default function RephrasePopup({
  fieldName,
  fieldValue,
  isOpen,
  onClose,
  onApply,
  apiKey,
}: RephrasePopupProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedWords, setAnalyzedWords] = useState<AnalyzedWord[]>([]);
  const [selectedWord, setSelectedWord] = useState<AnalyzedWord | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [appliedChanges, setAppliedChanges] = useState<Set<string>>(new Set());
  const [usageInfo, setUsageInfo] = useState({ remaining: 10, dailyLimit: 10, improvementRemaining: 5 });

  const fieldLabels: Record<string, string> = {
    activities: "1. Activities Today",
    tools: "2. Tools & Technologies",
    problems: "3. Problems Encountered",
    lessonsLearned: "4. Lessons Learned",
  };

  const displayValue = useMemo(() => {
    return fieldValue;
  }, [fieldValue, appliedChanges]);

  const highlightedText = useMemo(() => {
    if (!displayValue || analyzedWords.length === 0) {
      return <span style={{ color: "#334155" }}>{displayValue}</span>;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    const sortedWords = [...analyzedWords].sort((a, b) => a.startIndex - b.startIndex);

    sortedWords.forEach((wordObj, idx) => {
      if (wordObj.startIndex > lastIndex) {
        parts.push(
          <span key={`text-${idx}`}>
            {displayValue.slice(lastIndex, wordObj.startIndex)}
          </span>
        );
      }

      const isApplied = appliedChanges.has(wordObj.word);
      parts.push(
        <span
          key={`word-${idx}`}
          onClick={() => handleWordClick(wordObj)}
          className="cursor-pointer px-1 rounded transition-all"
          style={{
            backgroundColor: isApplied ? "#DCFCE7" : "#FEF9C3",
            color: isApplied ? "#16A34A" : "#D97706",
          }}
          title="Click to see suggestions"
        >
          {wordObj.word}
        </span>
      );

      lastIndex = wordObj.endIndex;
    });

    if (lastIndex < displayValue.length) {
      parts.push(<span key="text-end" style={{ color: "#334155" }}>{displayValue.slice(lastIndex)}</span>);
    }

    return <>{parts}</>;
  }, [displayValue, analyzedWords, appliedChanges]);

  const analyzeText = async () => {
    if (!displayValue.trim()) return;

    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/rephrase/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: displayValue,
          fieldName
        }),
      });

      const data = await response.json();

      if (data.suggestions) {
        const words: AnalyzedWord[] = data.suggestions.map((s: WordSuggestion) => {
          const regex = new RegExp(`\\b${escapeRegex(s.originalWord)}\\b`, "gi");
          const match = displayValue.match(regex);
          return {
            word: s.originalWord,
            sentence: s.sentence,
            suggestions: s.suggestions,
            startIndex: match ? displayValue.indexOf(match[0]) : -1,
            endIndex: match ? displayValue.indexOf(match[0]) + match[0].length : -1,
            score: s.scores.wordScore,
          };
        }).filter((w: AnalyzedWord) => w.startIndex >= 0);

        setAnalyzedWords(words);
      }

      setUsageInfo(getUsageStats());
    } catch (error) {
      console.error("Analyze error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const escapeRegex = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const handleWordClick = async (wordObj: AnalyzedWord) => {
    if (appliedChanges.has(wordObj.word)) return;

    setSelectedWord(wordObj);
    setIsLoadingSuggestions(true);

    try {
      const response = await fetch("/api/rephrase/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: wordObj.word,
          sentence: wordObj.sentence
        }),
      });

      const data = await response.json();
      setSuggestions(data.suggestions || wordObj.suggestions);
    } catch (error) {
      console.error("Suggestions error:", error);
      setSuggestions(wordObj.suggestions);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleApplySuggestion = (suggestion: string) => {
    if (!selectedWord) return;

    const regex = new RegExp(`\\b${escapeRegex(selectedWord.word)}\\b`, "gi");
    const newValue = displayValue.replace(regex, suggestion);

    onApply(fieldName, newValue);
    setAppliedChanges((prev) => new Set([...prev, selectedWord.word]));
    setSelectedWord(null);
    setSuggestions([]);
    setUsageInfo(getUsageStats());
  };

  const handleIgnoreWord = () => {
    if (!selectedWord) return;
    setAppliedChanges((prev) => new Set([...prev, selectedWord.word]));
    setSelectedWord(null);
    setSuggestions([]);
  };

  const handleClose = () => {
    setSelectedWord(null);
    setSuggestions([]);
    onClose();
  };

  useEffect(() => {
    if (isOpen && displayValue) {
      analyzeText();
    }
  }, [isOpen, displayValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        className="relative w-full max-w-lg h-full bg-white shadow-2xl overflow-hidden flex flex-col"
        style={{ animation: 'slide-in 0.3s ease-out' }}
      >
        <div
          className="p-4 text-white"
          style={{
            background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
            boxShadow: '0 2px 8px rgba(217, 119, 6, 0.2)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                🔄 Rephrase & Improve
              </h2>
              <p className="text-sm text-white/80 mt-1">
                {usageInfo.improvementRemaining}/5 improvements left
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div
          className="px-4 py-3 border-b"
          style={{ backgroundColor: "#F8FAFC", borderColor: "#E2E8F0" }}
        >
          <p className="text-sm font-medium" style={{ color: "#334155" }}>
            {fieldLabels[fieldName] || fieldName}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2" style={{ color: "#64748B" }}>
              📝 Your Text (click yellow words to improve)
            </h3>
            <div
              className="rounded-xl p-4 leading-relaxed whitespace-pre-wrap"
              style={{ backgroundColor: "#F8FAFC", border: '1px solid #E2E8F0', color: "#334155" }}
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2" style={{ color: "#64748B" }}>
                  <div className="animate-spin">⚙️</div>
                  Analyzing text...
                </div>
              ) : analyzedWords.length > 0 ? (
                highlightedText
              ) : (
                <span style={{ color: "#64748B" }}>No suggestions available</span>
              )}
            </div>
          </div>

          <div className="flex gap-4 mb-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: "#FEF9C3" }}></span>
              <span style={{ color: "#64748B" }}>Clickable</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: "#DCFCE7" }}></span>
              <span style={{ color: "#64748B" }}>Applied</span>
            </div>
          </div>

          {selectedWord && (
            <div
              className="rounded-xl p-4 border"
              style={{
                backgroundColor: "#FFFBEB",
                borderColor: "#FDE68A"
              }}
            >
              <div className="mb-3">
                <p className="text-sm" style={{ color: "#64748B" }}>Word:</p>
                <p className="text-lg font-semibold" style={{ color: "#1E293B" }}>
                  "{selectedWord.word}"
                </p>
                <p className="text-xs mt-1" style={{ color: "#64748B" }}>
                  In: "{selectedWord.sentence}"
                </p>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium mb-2" style={{ color: "#334155" }}>
                  💡 Click a suggestion to replace:
                </p>

                {isLoadingSuggestions ? (
                  <div className="flex items-center gap-2" style={{ color: "#64748B" }}>
                    <div className="animate-spin text-sm">⚙️</div>
                    Loading suggestions...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleApplySuggestion(suggestion)}
                        className="text-left px-3 py-2 rounded-lg border text-sm transition-all hover:scale-[1.02]"
                        style={{
                          backgroundColor: "#FFFFFF",
                          borderColor: "#E2E8F0",
                          color: "#334155"
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleIgnoreWord}
                  className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                  style={{ backgroundColor: "#E2E8F0", color: "#334155" }}
                >
                  Ignore Word
                </button>
                <button
                  onClick={() => setSelectedWord(null)}
                  className="py-2 px-3 rounded-lg transition-colors"
                  style={{ backgroundColor: "#E2E8F0", color: "#334155" }}
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div
            className="mt-4 p-3 rounded-lg"
            style={{ backgroundColor: "#F8FAFC", border: '1px solid #E2E8F0' }}
          >
            <div className="flex justify-between text-sm">
              <span style={{ color: "#64748B" }}>Words analyzed:</span>
              <span className="font-medium" style={{ color: "#1E293B" }}>
                {analyzedWords.length}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span style={{ color: "#64748B" }}>Changes applied:</span>
              <span className="font-medium" style={{ color: "#16A34A" }}>
                {appliedChanges.size}
              </span>
            </div>
          </div>
        </div>

        <div
          className="p-4 border-t"
          style={{ backgroundColor: "#F8FAFC", borderColor: "#E2E8F0" }}
        >
          <button
            onClick={handleClose}
            className="w-full py-3 rounded-xl font-medium transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
              color: "white",
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.2)'
            }}
          >
            Done - Apply Changes
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

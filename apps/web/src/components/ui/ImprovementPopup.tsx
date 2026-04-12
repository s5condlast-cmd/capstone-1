"use client";

import { useState } from "react";
import { FieldSuggestion } from "@/lib/analyzers/improvement-analyzer";

interface ImprovementPopupProps {
  suggestions: FieldSuggestion[];
  isOpen: boolean;
  onClose: () => void;
  onApply: (field: string, improvedText: string) => void;
  improvementRemaining: number;
}

const fieldLabels: Record<string, string> = {
  activities: "1. Activities Today",
  tools: "2. Tools & Technologies",
  problems: "3. Problems Encountered",
  lessonsLearned: "4. Lessons Learned",
};

const fieldColors: Record<string, { border: string; bg: string; badge: string }> = {
  activities: { border: "border-blue-500", bg: "bg-blue-50", badge: "bg-blue-500" },
  tools: { border: "border-green-500", bg: "bg-green-50", badge: "bg-green-500" },
  problems: { border: "border-orange-500", bg: "bg-orange-50", badge: "bg-orange-500" },
  lessonsLearned: { border: "border-purple-500", bg: "bg-purple-50", badge: "bg-purple-500" },
};

export default function ImprovementPopup({
  suggestions,
  isOpen,
  onClose,
  onApply,
  improvementRemaining,
}: ImprovementPopupProps) {
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleApply = (suggestion: FieldSuggestion) => {
    const key = `${suggestion.field}-${suggestion.originalText.substring(0, 20)}`;
    setAppliedSuggestions((prev) => new Set([...prev, key]));
    onApply(suggestion.field, suggestion.improvedText);
  };

  const isApplied = (suggestion: FieldSuggestion) => {
    const key = `${suggestion.field}-${suggestion.originalText.substring(0, 20)}`;
    return appliedSuggestions.has(key);
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return "#16A34A";
    if (score >= 4) return "#D97706";
    return "#DC2626";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 7) return "Good";
    if (score >= 4) return "Fair";
    return "Needs Work";
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto"
        style={{ animation: 'slide-in 0.3s ease-out' }}
      >
        <div
          className="sticky top-0 p-4 text-white z-10"
          style={{
            background: 'linear-gradient(135deg, #00529B 0%, #0073C7 100%)',
            boxShadow: '0 2px 8px rgba(0, 82, 155, 0.2)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                💡 Improvement Suggestions
              </h2>
              <p className="text-sm text-white/80 mt-1">
                {improvementRemaining}/5 improvements left today
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {suggestions.map((suggestion, index) => {
            const colors = fieldColors[suggestion.field];
            const applied = isApplied(suggestion);

            return (
              <div
                key={index}
                className={`border-l-4 ${colors.border} ${colors.bg} rounded-xl p-4 transition-all ${
                  applied ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium" style={{ color: "#1E293B" }}>
                    {fieldLabels[suggestion.field]}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-medium"
                      style={{ color: getScoreColor(suggestion.score) }}
                    >
                      {suggestion.score}/10
                    </span>
                    <span
                      className="text-xs px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: colors.badge.replace('bg-', '') === 'blue-500' ? '#3B82F6' : colors.badge.includes('green') ? '#22C55E' : colors.badge.includes('orange') ? '#F97316' : '#A855F7' }}
                    >
                      {getScoreLabel(suggestion.score)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {suggestion.originalText && (
                    <div>
                      <p className="text-xs mb-1" style={{ color: "#64748B" }}>Current:</p>
                      <p
                        className="text-sm rounded-lg p-3"
                        style={{ backgroundColor: "#FFFFFF", color: "#334155", border: '1px solid #E2E8F0' }}
                      >
                        {suggestion.originalText}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs mb-1" style={{ color: "#64748B" }}>Suggested:</p>
                    <p
                      className="text-sm rounded-lg p-3"
                      style={{ backgroundColor: "#FFFFFF", color: "#334155", border: '1px solid #E2E8F0' }}
                    >
                      {suggestion.improvedText}
                    </p>
                  </div>

                  <p className="text-xs italic" style={{ color: "#64748B" }}>
                    💬 {suggestion.explanation}
                  </p>

                  {!applied && (
                    <button
                      onClick={() => handleApply(suggestion)}
                      className="w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all hover:scale-[1.02]"
                      style={{
                        background: 'linear-gradient(135deg, #00529B 0%, #0073C7 100%)',
                        color: "white",
                        boxShadow: '0 2px 8px rgba(0, 82, 155, 0.2)'
                      }}
                    >
                      ✓ Apply This Improvement
                    </button>
                  )}
                  {applied && (
                    <p className="text-center text-sm font-medium" style={{ color: "#16A34A" }}>
                      ✓ Applied
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: "#F8FAFC", border: '1px solid #E2E8F0' }}
          >
            <h3 className="font-medium mb-2" style={{ color: "#1E293B" }}>
              📋 Overall Assessment
            </h3>
            <p className="text-sm" style={{ color: "#64748B" }}>
              {suggestions.length > 0
                ? `Based on ${suggestions.length} analyzed fields. Click on suggestions above to apply them.`
                : "No suggestions available."}
            </p>
          </div>
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

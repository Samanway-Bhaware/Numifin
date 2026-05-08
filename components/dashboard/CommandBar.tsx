"use client";

import { useState } from "react";
import { Send, Loader2, Bot } from "lucide-react";

const SUGGESTIONS = [
  "What is our runway?",
  "Show top spending categories",
  "Why did expenses spike last month?",
  "Which transactions are uncategorized?",
  "Generate a financial summary",
];

interface CommandBarProps {
  onSubmit: (query: string) => Promise<string>;
}

export function CommandBar({ onSubmit }: CommandBarProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  async function handleSubmit(query: string) {
    if (!query.trim() || loading) return;
    setLoading(true);
    setResponse(null);
    try {
      const result = await onSubmit(query.trim());
      setResponse(result);
    } catch {
      setResponse("Sorry, I couldn't process that request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#E1E1E1] bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bot className="h-4 w-4 text-[#3C366B]" />
        <span className="text-sm font-semibold text-gray-700">Ask your CFO Agent</span>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setInput(s);
              handleSubmit(s);
            }}
            className="text-xs rounded-full border border-[#E1E1E1] px-2.5 py-1 text-gray-500 hover:bg-[#EAE6F7] hover:text-[#3C366B] hover:border-[#3C366B]/30 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(input);
            }
          }}
          placeholder="Ask a finance question..."
          className="flex-1 h-9 rounded-lg border border-[#E1E1E1] bg-[#FAFAFA] px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3C366B]/30 focus:border-[#3C366B]"
        />
        <button
          onClick={() => handleSubmit(input)}
          disabled={!input.trim() || loading}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3C366B] text-white hover:bg-[#534d8a] disabled:opacity-40 transition-colors"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Response */}
      {response && (
        <div className="mt-3 rounded-lg bg-[#FAFAFA] border border-[#E1E1E1] p-3">
          <div className="flex items-start gap-2">
            <Bot className="h-4 w-4 text-[#3C366B] mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {response}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

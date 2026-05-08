"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "What is our current runway?",
  "Which categories are driving the most spend?",
  "How does this month's burn rate compare to last month?",
  "What are our top 5 expenses?",
  "Are there any spending anomalies I should know about?",
  "Give me a financial health summary",
];

export function CFOChatClient() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your CFO Agent. I have access to your transaction history and financial data. Ask me anything — from runway calculations to spending breakdowns.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(query: string) {
    if (!query.trim() || loading) return;

    const userMsg: Message = { role: "user", content: query, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      const assistantMsg: Message = {
        role: "assistant",
        content: res.ok ? data.response : "Sorry, I couldn't process that request.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto px-6">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-thin">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            {msg.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#3C366B]">
                <Bot className="h-4 w-4 text-[#00D9C0]" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#3C366B] text-white rounded-br-sm"
                  : "bg-white border border-[#E1E1E1] text-gray-800 rounded-bl-sm shadow-sm"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p
                className={`text-[10px] mt-1.5 ${
                  msg.role === "user" ? "text-white/50" : "text-gray-400"
                }`}
              >
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            {msg.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                <User className="h-4 w-4 text-gray-500" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start animate-fade-in">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#3C366B]">
              <Bot className="h-4 w-4 text-[#00D9C0]" />
            </div>
            <div className="rounded-2xl rounded-bl-sm bg-white border border-[#E1E1E1] px-4 py-3.5 shadow-sm">
              <div className="flex gap-1.5 items-center">
                <div className="typing-dot h-1.5 w-1.5 rounded-full bg-gray-400" />
                <div className="typing-dot h-1.5 w-1.5 rounded-full bg-gray-400" />
                <div className="typing-dot h-1.5 w-1.5 rounded-full bg-gray-400" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions (show only on first message) */}
      {messages.length <= 1 && (
        <div className="py-3">
          <p className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            Suggested questions
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-xs rounded-full border border-[#E1E1E1] bg-white px-3 py-1.5 text-gray-600 hover:bg-[#EAE6F7] hover:text-[#3C366B] hover:border-[#3C366B]/30 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="pb-6">
        <div className="flex gap-2 rounded-2xl border border-[#E1E1E1] bg-white p-2 shadow-sm">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(input);
              }
            }}
            placeholder="Ask your CFO Agent a financial question..."
            className="flex-1 bg-transparent px-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:ring-0"
            aria-label="Ask your CFO Agent"
            disabled={loading}
          />
          <Button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || loading}
            size="sm"
            className="rounded-xl"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          Answers are grounded in your transaction data. Always verify financial decisions independently.
        </p>
      </div>
    </div>
  );
}

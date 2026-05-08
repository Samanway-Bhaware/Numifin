"use client";

import { Bot, RefreshCw, TrendingUp, MessageSquare, FileText, Loader2 } from "lucide-react";
import type { AgentActivity } from "@/lib/schema";

const agentIcons = {
  bookkeeper: Bot,
  reconciliation: RefreshCw,
  cashflow: TrendingUp,
  cfo: MessageSquare,
  document: FileText,
};

const agentColors = {
  bookkeeper: "text-[#3C366B] bg-[#EAE6F7]",
  reconciliation: "text-teal-600 bg-teal-50",
  cashflow: "text-blue-600 bg-blue-50",
  cfo: "text-orange-600 bg-orange-50",
  document: "text-green-600 bg-green-50",
};

const statusColors = {
  running: "text-amber-600 bg-amber-50",
  done: "text-green-600 bg-green-50",
  failed: "text-red-600 bg-red-50",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface AgentActivityFeedProps {
  activities: AgentActivity[];
}

export function AgentActivityFeed({ activities }: AgentActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 mb-3">
          <Bot className="h-6 w-6 text-gray-300" />
        </div>
        <p className="text-sm font-medium text-gray-500">No agent activity yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Upload transactions to activate your AI agents
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((activity, index) => {
        const Icon = agentIcons[activity.agent] ?? Bot;
        const iconColors = agentColors[activity.agent] ?? "text-gray-500 bg-gray-100";
        const statusColor = statusColors[activity.status] ?? "text-gray-500 bg-gray-100";
        const delayClass = `delay-${Math.min(index + 1, 6)}` as const;

        return (
          <div
            key={activity.id}
            className={`flex items-start gap-3 rounded-lg p-3 hover:bg-gray-50 transition-colors animate-enter ${delayClass}`}
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${iconColors}`}>
              {activity.status === "running" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 leading-snug">{activity.action}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusColor}`}>
                  {activity.status}
                </span>
                <span className="text-[11px] text-gray-400">
                  {timeAgo(activity.created_at)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

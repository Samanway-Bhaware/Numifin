"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bot,
  RefreshCw,
  TrendingUp,
  MessageSquare,
  FileText,
  Play,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AgentActivity } from "@/lib/schema";

const AGENTS = [
  {
    id: "bookkeeper",
    name: "Bookkeeper Agent",
    description:
      "Classifies transactions using your rules and AI. Applies custom prompts, categories, and historical patterns.",
    icon: Bot,
    color: "text-[#3C366B]",
    bg: "bg-[#EAE6F7]",
    action: "/api/transactions/classify-all",
    actionLabel: "Classify all transactions",
    method: "POST",
    kind: "api" as const,
  },
  {
    id: "reconciliation",
    name: "Reconciliation Agent",
    description:
      "Detects duplicate transactions and flags mismatches. Scans all transactions for anomalies.",
    icon: RefreshCw,
    color: "text-teal-600",
    bg: "bg-teal-50",
    action: "/api/agents/reconcile",
    actionLabel: "Run reconciliation scan",
    method: "POST",
    kind: "api" as const,
  },
  {
    id: "document",
    name: "Document Agent",
    description:
      "Extracts structured data from receipts, invoices, and PDFs using OCR + LLM processing.",
    icon: FileText,
    color: "text-green-600",
    bg: "bg-green-50",
    action: null,
    actionLabel: "Upload a document",
    method: null,
    kind: "upload" as const,
  },
  {
    id: "cashflow",
    name: "Cash Flow Agent",
    description:
      "Calculates burn rate, runway, and monthly trends. All calculations are deterministic — no hallucinations.",
    icon: TrendingUp,
    color: "text-blue-600",
    bg: "bg-blue-50",
    action: "/reports",
    actionLabel: "View in Reports",
    method: null,
    kind: "navigate" as const,
  },
  {
    id: "cfo",
    name: "CFO Agent",
    description:
      "Answers your finance questions in plain English. Grounded in your actual transaction data.",
    icon: MessageSquare,
    color: "text-orange-600",
    bg: "bg-orange-50",
    action: "/cfo",
    actionLabel: "Open CFO chat",
    method: null,
    kind: "navigate" as const,
  },
];

function statusIcon(status: AgentActivity["status"]) {
  if (status === "running") return <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />;
  if (status === "done") return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
  return <XCircle className="h-3.5 w-3.5 text-red-400" />;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface AgentsClientProps {
  activities: AgentActivity[];
}

export function AgentsClient({ activities: initial }: AgentsClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activities, setActivities] = useState<AgentActivity[]>(initial);
  const [running, setRunning] = useState<string | null>(null);

  async function refreshActivities() {
    const fresh = await fetch("/api/activities").then((r) => r.json()).catch(() => ({ activities: [] }));
    if (fresh.activities) setActivities(fresh.activities);
  }

  async function runAgent(agentId: string, endpoint: string, method: string) {
    setRunning(agentId);
    try {
      const res = await fetch(endpoint, { method });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Agent failed");
        return;
      }

      let msg = "Agent completed";
      if (agentId === "bookkeeper" && "classified" in data) {
        msg = `Classified ${data.classified} transactions`;
      } else if (agentId === "reconciliation" && "flagged" in data) {
        msg = data.flagged > 0 ? `Flagged ${data.flagged} possible duplicates` : "No duplicates found";
      }

      toast.success(msg);
      await refreshActivities();
    } catch {
      toast.error("Agent run failed");
    } finally {
      setRunning(null);
    }
  }

  async function handleFileUpload(file: File) {
    setRunning("document");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/documents", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Document processing failed");
        return;
      }

      const count = data.transactionsCreated ?? 0;
      toast.success(`Document processed — ${count} transaction${count === 1 ? "" : "s"} extracted`);
      await refreshActivities();
    } catch {
      toast.error("Upload failed");
    } finally {
      setRunning(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const activitiesByAgent = (agentId: string) =>
    activities.filter((a) => a.agent === agentId).slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Hidden file input for document upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.txt"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />

      {AGENTS.map((agent) => {
        const recentActivity = activitiesByAgent(agent.id);
        const isRunning = running === agent.id;

        function handleClick() {
          if (agent.kind === "api" && agent.action && agent.method) {
            runAgent(agent.id, agent.action, agent.method);
          } else if (agent.kind === "upload") {
            fileInputRef.current?.click();
          } else if (agent.kind === "navigate" && agent.action) {
            router.push(agent.action);
          }
        }

        return (
          <div
            key={agent.id}
            className="rounded-xl border border-[#E1E1E1] bg-white p-5 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${agent.bg}`}>
                  {isRunning ? (
                    <Loader2 className={`h-5 w-5 animate-spin ${agent.color}`} />
                  ) : (
                    <agent.icon className={`h-5 w-5 ${agent.color}`} />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        isRunning ? "bg-amber-400 animate-pulse" : "bg-green-400"
                      }`}
                    />
                    <span className="text-[11px] text-gray-400">
                      {isRunning ? "Running..." : "Ready"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-4 leading-relaxed">{agent.description}</p>

            {/* Action button */}
            <Button
              size="sm"
              variant={agent.kind === "navigate" ? "outline" : "default"}
              onClick={handleClick}
              loading={isRunning}
              disabled={isRunning}
              className="w-full mb-4"
            >
              {agent.kind === "upload" ? (
                <Upload className="h-3.5 w-3.5" />
              ) : agent.kind === "navigate" ? (
                <agent.icon className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              {agent.actionLabel}
            </Button>

            {/* Recent activity */}
            {recentActivity.length > 0 && (
              <div className="border-t border-[#E1E1E1] pt-3 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Recent Activity
                </p>
                {recentActivity.map((act) => (
                  <div key={act.id} className="flex items-start gap-2">
                    {statusIcon(act.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 leading-snug truncate">{act.action}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(act.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Full activity log */}
      <div className="lg:col-span-2">
        <div className="rounded-xl border border-[#E1E1E1] bg-white">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E1E1E1]">
            <h3 className="font-semibold text-gray-900">Agent Activity Log</h3>
            <Badge variant="secondary">{activities.length} events</Badge>
          </div>
          <div className="divide-y divide-[#E1E1E1]/60">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Clock className="h-8 w-8 text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">No agent activity yet</p>
              </div>
            ) : (
              activities.slice(0, 30).map((act) => (
                <div key={act.id} className="flex items-start gap-3 px-5 py-3">
                  {statusIcon(act.status)}
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{act.action}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px]">
                        {act.agent}
                      </Badge>
                      <span className="text-[11px] text-gray-400">{timeAgo(act.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

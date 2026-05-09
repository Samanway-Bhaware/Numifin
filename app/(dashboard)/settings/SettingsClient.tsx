"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Bot, Database, User, Shield, Eye, EyeOff, Save,
  CheckCircle2, Sparkles, X, CreditCard, ArrowUpRight, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Subscription } from "@/lib/subscription";
import { PLANS } from "@/lib/stripe";

const GEMINI_MODELS = [
  { value: "gemini-3-flash-preview", label: "Gemini 2.5 Flash", desc: "Fast · default" },
  { value: "gemini-2.5-pro-preview-05-06",   label: "Gemini 2.5 Pro",   desc: "Best quality" },
  { value: "gemini-2.0-flash",               label: "Gemini 2.0 Flash", desc: "Stable" },
];

const OPENAI_MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o mini", desc: "Fast & affordable" },
  { value: "gpt-4o",      label: "GPT-4o",      desc: "Best quality" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo", desc: "High capability" },
];

interface SettingsClientProps {
  currentModel: string;
  hasCustomKey: boolean;
  hasCustomDb: boolean;
  email: string;
  fullName: string;
  subscription: Subscription;
}

export function SettingsClient({
  currentModel,
  hasCustomKey,
  hasCustomDb,
  email,
  fullName,
  subscription,
}: SettingsClientProps) {
  // ── Billing state ─────────────────────────────────────────
  const [loadingPortal, setLoadingPortal] = useState(false);

  async function handleManageBilling() {
    setLoadingPortal(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast.error(data.error ?? "Could not open billing portal");
    } catch {
      toast.error("Failed to open billing portal");
    } finally {
      setLoadingPortal(false);
    }
  }
  // ── AI state ──────────────────────────────────────────────
  const initProvider = currentModel.startsWith("gemini") ? "gemini" : "openai";
  const [useCustomAI, setUseCustomAI] = useState(hasCustomKey);
  const [aiProvider, setAiProvider] = useState<"gemini" | "openai">(initProvider);
  const [model, setModel] = useState(currentModel);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [validating, setValidating] = useState(false);
  const [keyValid, setKeyValid] = useState<boolean | null>(null);
  const [savingAI, setSavingAI] = useState(false);

  // ── DB state ──────────────────────────────────────────────
  const [dbUrl, setDbUrl] = useState("");
  const [showDbUrl, setShowDbUrl] = useState(false);
  const [savingDb, setSavingDb] = useState(false);

  const modelList = aiProvider === "gemini" ? GEMINI_MODELS : OPENAI_MODELS;

  function handleProviderChange(p: "gemini" | "openai") {
    setAiProvider(p);
    setModel(p === "gemini" ? "gemini-3-flash-preview" : "gpt-4o-mini");
    setKeyValid(null);
  }

  async function handleValidateKey() {
    if (!apiKey) return;
    setValidating(true);
    setKeyValid(null);
    try {
      const res = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, model, provider: aiProvider }),
      });
      const data = await res.json();
      setKeyValid(data.valid);
      if (data.valid) toast.success("API key is valid");
      else toast.error("Key validation failed: " + (data.error ?? "Invalid key"));
    } catch {
      setKeyValid(false);
      toast.error("Could not validate key");
    } finally {
      setValidating(false);
    }
  }

  async function handleSaveAI() {
    setSavingAI(true);
    try {
      const body: Record<string, unknown> = { model };
      if (useCustomAI && apiKey) body.apiKey = apiKey;
      if (!useCustomAI) body.apiKey = null; // clear stored key

      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success("AI settings saved");
        setApiKey("");
        setKeyValid(null);
      } else {
        const err = await res.json();
        toast.error(err.error ?? "Failed to save");
      }
    } catch {
      toast.error("Save failed");
    } finally {
      setSavingAI(false);
    }
  }

  async function handleSaveDb() {
    setSavingDb(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbUrl: dbUrl || null }),
      });

      if (res.ok) {
        toast.success(dbUrl ? "Database URL saved" : "Database URL removed");
        setDbUrl("");
      } else {
        const err = await res.json();
        toast.error(err.error ?? "Failed to save");
      }
    } catch {
      toast.error("Save failed");
    } finally {
      setSavingDb(false);
    }
  }

  const plan = subscription.plan;
  const planInfo = PLANS[plan];
  const isActive = subscription.status === "active" || subscription.status === "trialing";
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <div className="max-w-2xl space-y-5">

      {/* ── Billing ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gray-400" />
            <CardTitle>Billing & Plan</CardTitle>
          </div>
          <CardDescription>Manage your subscription and payment details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current plan */}
          <div className="flex items-center justify-between rounded-lg border border-[#E1E1E1] bg-[#F7F7F5] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(148,175,116,0.15)]">
                <Zap className="h-4 w-4 text-[#4a6e30]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{planInfo.name} plan</p>
                <p className="text-xs text-gray-400">
                  {plan === "starter"
                    ? "Free forever"
                    : isActive
                    ? `$${planInfo.price}/month${periodEnd ? ` · renews ${periodEnd}` : ""}`
                    : `Canceled${periodEnd ? ` · access until ${periodEnd}` : ""}`}
                </p>
              </div>
            </div>
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                isActive
                  ? "bg-[rgba(148,175,116,0.15)] text-[#4a6e30]"
                  : subscription.status === "past_due"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {isActive ? "Active" : subscription.status === "past_due" ? "Past due" : "Canceled"}
            </span>
          </div>

          {/* Plan features */}
          <ul className="grid grid-cols-2 gap-1.5">
            {planInfo.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#94af74] shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            {plan === "starter" && (
              <>
                <a href="/api/stripe/checkout?plan=pro">
                  <Button size="sm">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    Upgrade to Pro · $49/mo
                  </Button>
                </a>
                <a href="/api/stripe/checkout?plan=team">
                  <Button size="sm" variant="outline">
                    Upgrade to Team · $149/mo
                  </Button>
                </a>
              </>
            )}
            {plan === "pro" && (
              <>
                <a href="/api/stripe/checkout?plan=team">
                  <Button size="sm">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    Upgrade to Team · $149/mo
                  </Button>
                </a>
                <Button size="sm" variant="outline" onClick={handleManageBilling} loading={loadingPortal}>
                  Manage billing
                </Button>
              </>
            )}
            {plan === "team" && (
              <Button size="sm" variant="outline" onClick={handleManageBilling} loading={loadingPortal}>
                Manage billing
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Account ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <CardTitle>Account</CardTitle>
          </div>
          <CardDescription>Your NumiFin account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {fullName && (
            <div>
              <Label className="text-xs text-gray-400">Name</Label>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{fullName}</p>
            </div>
          )}
          <div>
            <Label className="text-xs text-gray-400">Email</Label>
            <p className="text-sm font-medium text-gray-900 mt-0.5">{email}</p>
          </div>
        </CardContent>
      </Card>

      {/* ── AI Configuration ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-gray-400" />
            <CardTitle>AI Configuration</CardTitle>
          </div>
          <CardDescription>
            NumiFin runs on Gemini by default. You can override with your own API key.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Default badge */}
          <div className="flex items-center justify-between rounded-lg border border-[#E1E1E1] bg-[#F7F7F5] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-[#94af74]" />
              <div>
                <p className="text-sm font-medium text-gray-900">NumiFin Gemini</p>
                <p className="text-xs text-gray-400">Powered by Google Gemini · no setup needed</p>
              </div>
            </div>
            {!useCustomAI && (
              <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-[rgba(148,175,116,0.15)] text-[#4a6e30]">
                Active
              </span>
            )}
          </div>

          {/* Toggle custom AI */}
          <div>
            <button
              onClick={() => { setUseCustomAI(!useCustomAI); setKeyValid(null); }}
              className="text-sm font-medium text-[#3C366B] hover:underline"
            >
              {useCustomAI ? "Remove custom key" : "Use my own API key"}
            </button>
          </div>

          {useCustomAI && (
            <div className="space-y-4 pt-1">
              {/* Provider selector */}
              <div>
                <Label className="mb-2 block">Provider</Label>
                <div className="flex gap-2">
                  {(["gemini", "openai"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => handleProviderChange(p)}
                      className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium capitalize transition-all ${
                        aiProvider === p
                          ? "border-[#94af74] bg-[rgba(148,175,116,0.1)] text-[#3a5c24]"
                          : "border-[#E1E1E1] text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {p === "gemini" ? "Google Gemini" : "OpenAI"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model selector */}
              <div>
                <Label className="mb-2 block">Model</Label>
                <div className="grid grid-cols-3 gap-2">
                  {modelList.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setModel(m.value)}
                      className={`rounded-lg border px-3 py-2.5 text-left transition-all ${
                        model === m.value
                          ? "border-[#94af74] bg-[rgba(148,175,116,0.1)]"
                          : "border-[#E1E1E1] hover:border-gray-300"
                      }`}
                    >
                      <p className={`text-sm font-medium ${model === m.value ? "text-[#3a5c24]" : "text-gray-900"}`}>
                        {m.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key */}
              <div>
                <Label htmlFor="api-key" className="mb-1.5 block">
                  {aiProvider === "gemini" ? "Gemini API Key" : "OpenAI API Key"}
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="api-key"
                      type={showApiKey ? "text" : "password"}
                      placeholder={hasCustomKey ? "Leave blank to keep existing key" : "Paste your API key…"}
                      value={apiKey}
                      onChange={(e) => { setApiKey(e.target.value); setKeyValid(null); }}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleValidateKey}
                    loading={validating}
                    disabled={!apiKey}
                  >
                    Validate
                  </Button>
                </div>
                {keyValid !== null && (
                  <div className={`mt-2 flex items-center gap-1.5 text-xs ${keyValid ? "text-green-600" : "text-red-500"}`}>
                    {keyValid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    {keyValid ? "Key verified" : "Validation failed"}
                  </div>
                )}
              </div>
            </div>
          )}

          <Button onClick={handleSaveAI} loading={savingAI}>
            <Save className="h-4 w-4" />
            Save AI settings
          </Button>
        </CardContent>
      </Card>

      {/* ── Database ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-gray-400" />
            <CardTitle>Database</CardTitle>
          </div>
          <CardDescription>
            By default NumiFin uses its managed Supabase instance.
            Connect your own PostgreSQL database for full data ownership.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-[#E1E1E1] bg-[#F7F7F5] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Managed Supabase</p>
              <p className="text-xs text-gray-400">Hosted & maintained by NumiFin</p>
            </div>
            {!hasCustomDb && (
              <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-[rgba(148,175,116,0.15)] text-[#4a6e30]">
                Active
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="db-url" className="mb-1.5 block">Custom database URL</Label>
            <div className="relative">
              <Input
                id="db-url"
                type={showDbUrl ? "text" : "password"}
                placeholder={hasCustomDb ? "Leave blank to keep existing URL" : "postgres://user:pass@host:5432/db"}
                value={dbUrl}
                onChange={(e) => setDbUrl(e.target.value)}
                className="pr-10 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowDbUrl(!showDbUrl)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showDbUrl ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Must be a reachable PostgreSQL connection string. Leave blank to use managed Supabase.
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveDb} loading={savingDb}>
              <Save className="h-4 w-4" />
              Save database settings
            </Button>
            {hasCustomDb && (
              <Button
                variant="outline"
                onClick={() => { setDbUrl(""); handleSaveDb(); }}
                className="text-red-500 border-red-200 hover:bg-red-50"
              >
                Remove custom DB
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Security ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-400" />
            <CardTitle>Security & Privacy</CardTitle>
          </div>
          <CardDescription>How NumiFin handles your credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {[
              "API keys and database URLs are encrypted at rest using AES-256-GCM",
              "Credentials are never logged, cached in plaintext, or sent to third parties",
              "AI calls go directly to Gemini or your configured provider — not proxied",
              "Financial data stays inside your Supabase project",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-[#94af74] shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

    </div>
  );
}

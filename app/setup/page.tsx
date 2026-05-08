"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Key,
  Database,
  ChevronRight,
  CheckCircle2,
  Zap,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o mini (fast, affordable)" },
  { value: "gpt-4o", label: "GPT-4o (best quality)" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (budget)" },
];

export default function SetupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const [form, setForm] = useState({
    apiKey: "",
    model: "gpt-4o-mini",
    dbUrl: "",
  });

  const [validating, setValidating] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "apiKey") setApiKeyValid(null);
  }

  async function validateApiKey() {
    if (!form.apiKey.startsWith("sk-")) {
      toast.error("API key should start with 'sk-'");
      return;
    }
    setValidating(true);
    try {
      const res = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: form.apiKey, model: form.model }),
      });
      const data = await res.json();
      if (data.valid) {
        setApiKeyValid(true);
        toast.success("API key is valid!");
      } else {
        setApiKeyValid(false);
        toast.error("API key validation failed: " + (data.error ?? "Invalid key"));
      }
    } catch {
      setApiKeyValid(false);
      toast.error("Could not validate key");
    } finally {
      setValidating(false);
    }
  }

  async function handleComplete() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: form.apiKey,
          model: form.model,
          dbUrl: form.dbUrl || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Setup failed");
        setLoading(false);
        return;
      }

      toast.success("Setup complete! Welcome to NumiFin.");
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const steps = [
    { num: 1, label: "AI Key" },
    { num: 2, label: "Model" },
    { num: 3, label: "Launch" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Top bar */}
      <div className="flex h-14 items-center gap-2 px-6 border-b border-[#E1E1E1] bg-white">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3C366B]">
          <Zap className="h-3.5 w-3.5 text-[#00D9C0]" />
        </div>
        <span className="font-bold text-[#3C366B]">NumiFin</span>
        <span className="text-gray-300 mx-2">|</span>
        <span className="text-sm text-gray-500">Workspace Setup</span>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-lg animate-slide-up">
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                    step > s.num
                      ? "bg-[#00D9C0] text-white"
                      : step === s.num
                      ? "bg-[#3C366B] text-white"
                      : "bg-[#E1E1E1] text-gray-400"
                  }`}
                >
                  {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                </div>
                <span
                  className={`text-sm font-medium ${
                    step === s.num ? "text-[#3C366B]" : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div className="w-8 h-px bg-[#E1E1E1] mx-1" />
                )}
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[#E1E1E1] bg-white p-8 shadow-[0_4px_24px_rgb(0_0_0/0.07)]">
            {/* Step 1 — API Key */}
            {step === 1 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAE6F7]">
                    <Key className="h-5 w-5 text-[#3C366B]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Your AI API key</h2>
                    <p className="text-sm text-gray-500">
                      NumiFin uses your key — we never store it in plaintext.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="apiKey">OpenAI API Key</Label>
                    <div className="relative">
                      <Input
                        id="apiKey"
                        type={showApiKey ? "text" : "password"}
                        placeholder="sk-..."
                        value={form.apiKey}
                        onChange={(e) => update("apiKey", e.target.value)}
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
                    <p className="text-xs text-gray-400">
                      Get yours at platform.openai.com → API keys
                    </p>
                  </div>

                  {apiKeyValid !== null && (
                    <div
                      className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${
                        apiKeyValid
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {apiKeyValid ? "API key verified" : "Validation failed"}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={validateApiKey}
                      loading={validating}
                      disabled={!form.apiKey}
                      className="flex-1"
                    >
                      Validate key
                    </Button>
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!form.apiKey}
                      className="flex-1"
                    >
                      Continue
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Model */}
            {step === 2 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAE6F7]">
                    <Sparkles className="h-5 w-5 text-[#3C366B]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Choose your model</h2>
                    <p className="text-sm text-gray-500">
                      This controls which model your AI agents use.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {MODELS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => update("model", m.value)}
                      className={`w-full flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                        form.model === m.value
                          ? "border-[#3C366B] bg-[#EAE6F7]"
                          : "border-[#E1E1E1] hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          form.model === m.value
                            ? "border-[#3C366B]"
                            : "border-gray-300"
                        }`}
                      >
                        {form.model === m.value && (
                          <div className="h-2 w-2 rounded-full bg-[#3C366B]" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* Optional DB URL */}
                <div className="border-t border-[#E1E1E1] pt-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      Custom database URL{" "}
                      <span className="text-gray-400 font-normal">(optional)</span>
                    </span>
                  </div>
                  <Input
                    type="password"
                    placeholder="postgres://user:pass@host:5432/db"
                    value={form.dbUrl}
                    onChange={(e) => update("dbUrl", e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Leave blank to use NumiFin&apos;s managed Supabase.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1">
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3 — Launch */}
            {step === 3 && (
              <div className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAE6F7] mx-auto mb-5">
                  <Zap className="h-8 w-8 text-[#3C366B]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  You&apos;re all set!
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Your AI agents are ready to work. Upload your first transactions to get started.
                </p>

                <div className="bg-[#FAFAFA] rounded-xl p-4 text-left space-y-3 mb-6">
                  {[
                    { label: "AI Model", value: form.model },
                    { label: "API Key", value: "sk-•••••••••••••••" },
                    { label: "Database", value: form.dbUrl ? "Custom PostgreSQL" : "Managed Supabase" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{row.label}</span>
                      <span className="font-medium text-gray-900">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleComplete} loading={loading} className="flex-1">
                    Launch NumiFin
                    <Zap className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

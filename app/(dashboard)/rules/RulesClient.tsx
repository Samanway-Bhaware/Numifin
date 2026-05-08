"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  BookOpen,
  Tags,
  ToggleLeft,
  ToggleRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { UserPrompt, Category } from "@/lib/schema";

// ─── Prompt Rules ────────────────────────────────────────────

interface PromptRulesProps {
  prompts: UserPrompt[];
  onPromptChange: (prompts: UserPrompt[]) => void;
}

function PromptRules({ prompts, onPromptChange }: PromptRulesProps) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  async function handleCreate() {
    if (!name || !text) return;
    setSaving(true);
    const res = await fetch("/api/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, prompt_text: text }),
    });
    if (res.ok) {
      const { rule } = await res.json();
      onPromptChange([rule, ...prompts]);
      setName("");
      setText("");
      setCreating(false);
      toast.success("Rule created");
    } else {
      toast.error("Failed to create rule");
    }
    setSaving(false);
  }

  async function handleToggle(prompt: UserPrompt) {
    const res = await fetch(`/api/rules/${prompt.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !prompt.is_active }),
    });
    if (res.ok) {
      onPromptChange(
        prompts.map((p) =>
          p.id === prompt.id ? { ...p, is_active: !p.is_active } : p
        )
      );
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/rules/${id}`, { method: "DELETE" });
    if (res.ok) {
      onPromptChange(prompts.filter((p) => p.id !== id));
      toast.success("Rule deleted");
    }
  }

  async function handleEditSave(id: string) {
    const res = await fetch(`/api/rules/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt_text: editText }),
    });
    if (res.ok) {
      onPromptChange(prompts.map((p) => p.id === id ? { ...p, prompt_text: editText } : p));
      setEditingId(null);
      toast.success("Rule updated");
    }
  }

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="flex items-start gap-3 rounded-xl bg-[#EAE6F7] border border-[#3C366B]/10 p-4">
        <Info className="h-4 w-4 text-[#3C366B] mt-0.5 shrink-0" />
        <div className="text-sm text-[#3C366B]">
          <p className="font-medium mb-1">How rules work</p>
          <p className="text-[#3C366B]/70 leading-relaxed">
            Rules have highest classification priority. Use the format{" "}
            <code className="bg-[#3C366B]/10 px-1 rounded">keyword → Category</code> for
            automatic matching, or write free-form prompts for AI to interpret.
          </p>
          <p className="text-[#3C366B]/70 mt-1 text-xs">
            Examples: &quot;AWS → Infrastructure&quot; · &quot;Stripe fees → Payment Processing&quot; ·
            &quot;facebook → Marketing&quot;
          </p>
        </div>
      </div>

      {/* Create new rule */}
      {creating ? (
        <div className="rounded-xl border border-[#3C366B]/30 bg-white p-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="rule-name">Rule name</Label>
            <Input
              id="rule-name"
              placeholder="e.g. AWS Infrastructure Rule"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rule-text">Prompt / rule text</Label>
            <Textarea
              id="rule-text"
              placeholder="e.g. AWS → Infrastructure&#10;or: Any transaction from Stripe should be classified as Payment Processing"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-24"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} loading={saving} disabled={!name || !text}>
              Save rule
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          New rule
        </Button>
      )}

      {/* Rules list */}
      {prompts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-10 w-10 text-gray-200 mb-2" />
          <p className="text-gray-500 font-medium">No rules yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Create a rule to override default AI classification behavior
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className={`rounded-xl border p-4 transition-all ${
                prompt.is_active
                  ? "border-[#E1E1E1] bg-white"
                  : "border-[#E1E1E1] bg-gray-50 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-900">{prompt.name}</span>
                    {prompt.is_active ? (
                      <Badge variant="accent" className="text-[10px]">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
                    )}
                  </div>
                  {editingId === prompt.id ? (
                    <div className="space-y-2 mt-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="h-20 text-sm"
                      />
                      <div className="flex gap-1.5">
                        <Button size="sm" onClick={() => handleEditSave(prompt.id)}>
                          <Check className="h-3.5 w-3.5" /> Save
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                          <X className="h-3.5 w-3.5" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 font-mono bg-gray-50 rounded-lg px-2.5 py-1.5 mt-1">
                      {prompt.prompt_text}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggle(prompt)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
                    title={prompt.is_active ? "Disable" : "Enable"}
                  >
                    {prompt.is_active ? (
                      <ToggleRight className="h-4 w-4 text-[#00D9C0]" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => { setEditingId(prompt.id); setEditText(prompt.prompt_text); }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(prompt.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Categories ───────────────────────────────────────────────

interface CategoriesProps {
  categories: Category[];
  onChange: (categories: Category[]) => void;
}

const PRESET_COLORS = [
  "#3C366B", "#00D9C0", "#10b981", "#f59e0b",
  "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899",
  "#14b8a6", "#6b7280",
];

function Categories({ categories, onChange }: CategoriesProps) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!name) return;
    setSaving(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    if (res.ok) {
      const { category } = await res.json();
      onChange([...categories, category].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
      setCreating(false);
      toast.success("Category created");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      onChange(categories.filter((c) => c.id !== id));
      toast.success("Category deleted");
    }
  }

  return (
    <div className="space-y-4">
      {creating ? (
        <div className="rounded-xl border border-[#E1E1E1] bg-white p-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Category name</Label>
            <Input
              id="cat-name"
              placeholder="e.g. Infrastructure, Marketing, Payroll"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full border-2 transition-all ${
                    color === c ? "border-gray-900 scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} loading={saving} disabled={!name}>
              Create category
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          New category
        </Button>
      )}

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Tags className="h-10 w-10 text-gray-200 mb-2" />
          <p className="text-gray-500 font-medium">No custom categories yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Create categories to give your AI agents a taxonomy to work with
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group flex items-center justify-between rounded-xl border border-[#E1E1E1] bg-white px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm font-medium text-gray-800">{cat.name}</span>
              </div>
              <button
                onClick={() => handleDelete(cat.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

interface RulesClientProps {
  initialPrompts: UserPrompt[];
  initialCategories: Category[];
}

export function RulesClient({ initialPrompts, initialCategories }: RulesClientProps) {
  const [prompts, setPrompts] = useState<UserPrompt[]>(initialPrompts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  return (
    <Tabs defaultValue="rules">
      <TabsList className="mb-5">
        <TabsTrigger value="rules">
          <BookOpen className="h-3.5 w-3.5 mr-1.5" />
          Classification Rules
          {prompts.length > 0 && (
            <span className="ml-1.5 rounded-full bg-[#3C366B] text-white text-[10px] font-bold px-1.5 py-0">
              {prompts.filter((p) => p.is_active).length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="categories">
          <Tags className="h-3.5 w-3.5 mr-1.5" />
          Categories
          {categories.length > 0 && (
            <span className="ml-1.5 rounded-full bg-[#3C366B] text-white text-[10px] font-bold px-1.5 py-0">
              {categories.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="rules">
        <PromptRules prompts={prompts} onPromptChange={setPrompts} />
      </TabsContent>

      <TabsContent value="categories">
        <Categories categories={categories} onChange={setCategories} />
      </TabsContent>
    </Tabs>
  );
}

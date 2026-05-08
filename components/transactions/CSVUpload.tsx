"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface CSVUploadProps {
  onUploaded: (count: number) => void;
}

export function CSVUpload({ onUploaded }: CSVUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith(".csv")) setFile(f);
    else toast.error("Please upload a CSV file");
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/transactions", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Upload failed");
        return;
      }

      const { count } = await res.json();
      setDone(true);
      toast.success(`Imported ${count} transactions`);
      onUploaded(count);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function reset() {
    setFile(null);
    setDone(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="rounded-xl border border-[#E1E1E1] bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Import CSV</h3>

      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all ${
            dragging
              ? "border-[#3C366B] bg-[#EAE6F7]"
              : "border-[#E1E1E1] hover:border-[#3C366B]/50 hover:bg-gray-50"
          }`}
        >
          <Upload className={`h-8 w-8 mb-2 ${dragging ? "text-[#3C366B]" : "text-gray-300"}`} />
          <p className="text-sm font-medium text-gray-600">Drop CSV here or click to browse</p>
          <p className="text-xs text-gray-400 mt-1">
            Supports standard bank export formats
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-[#E1E1E1] p-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${done ? "bg-green-50" : "bg-[#EAE6F7]"}`}>
              {done ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <FileText className="h-5 w-5 text-[#3C366B]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-400">
                {(file.size / 1024).toFixed(1)} KB
                {done && " · Imported successfully"}
              </p>
            </div>
            {!uploading && (
              <button onClick={reset} className="text-gray-300 hover:text-gray-500">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {!done && (
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={reset}
                disabled={uploading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleUpload}
                loading={uploading}
                className="flex-1"
              >
                {uploading ? "Importing..." : "Import transactions"}
              </Button>
            </div>
          )}
        </div>
      )}

      <p className="mt-3 text-[11px] text-gray-400 leading-relaxed">
        Expected columns: <code className="bg-gray-100 px-1 rounded">date, description, amount</code>.
        Also supports: memo, narration, debit, credit, merchant, vendor.
      </p>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  Image,
  File,
  Loader2,
  XCircle,
  Eye,
  X,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, classifyConfidenceLabel } from "@/lib/utils";
import type { Document } from "@/lib/schema";

const FILE_ICONS: Record<string, React.ElementType> = {
  pdf: FileText,
  image: Image,
  receipt: FileText,
  invoice: FileText,
  statement: FileText,
  other: File,
};

function DocStatusBadge({ status }: { status: Document["status"] }) {
  const map = {
    pending: { variant: "secondary" as const, label: "Pending" },
    processing: { variant: "warning" as const, label: "Processing" },
    done: { variant: "success" as const, label: "Done" },
    failed: { variant: "error" as const, label: "Failed" },
  };
  const { variant, label } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

interface ExtractedViewProps {
  doc: Document;
  onClose: () => void;
}

function ExtractedView({ doc, onClose }: ExtractedViewProps) {
  const data = doc.extracted_data ?? {};
  const conf = doc.confidence ? classifyConfidenceLabel(doc.confidence) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-[#E1E1E1] bg-white shadow-xl animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E1E1E1]">
          <h3 className="font-bold text-gray-900">Extracted Data</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            {[
              { label: "Vendor", value: data.vendor },
              { label: "Amount", value: data.amount !== undefined ? formatCurrency(data.amount as number) : null },
              { label: "Date", value: data.date },
              { label: "Tax", value: data.tax !== undefined ? formatCurrency(data.tax as number) : null },
              { label: "Currency", value: data.currency },
              { label: "Category", value: doc.category },
            ]
              .filter((f) => f.value)
              .map((f) => (
                <div key={f.label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{f.label}</span>
                  <span className="font-medium text-gray-900">{f.value}</span>
                </div>
              ))}
          </div>

          {conf && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Confidence</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${conf.color}`}>
                {conf.label} ({((doc.confidence ?? 0) * 100).toFixed(0)}%)
              </span>
            </div>
          )}

          {doc.reasoning && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Agent Reasoning</p>
              <div className="rounded-lg bg-[#FAFAFA] border border-[#E1E1E1] p-3">
                <p className="text-sm text-gray-700">{doc.reasoning}</p>
              </div>
            </div>
          )}

          {Array.isArray(data.line_items) && data.line_items.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Line Items</p>
              <div className="rounded-lg border border-[#E1E1E1] overflow-hidden">
                {(data.line_items as Array<{ description: string; amount: number; quantity?: number }>).map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 text-sm border-t first:border-0 border-[#E1E1E1]">
                    <span className="text-gray-700 flex-1">{item.description}</span>
                    {item.quantity && (
                      <span className="text-gray-400 mx-3">×{item.quantity}</span>
                    )}
                    <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface DocumentsClientProps {
  initialDocuments: Document[];
}

interface DeleteModalProps {
  doc: Document;
  onConfirm: (deleteTransactions: boolean) => void;
  onCancel: () => void;
  loading: boolean;
}

function DeleteModal({ doc, onConfirm, onCancel, loading }: DeleteModalProps) {
  const hasTransactions =
    Array.isArray((doc.extracted_data as Record<string, unknown> | null)?.transaction_ids) &&
    ((doc.extracted_data as Record<string, unknown>).transaction_ids as string[]).length > 0;
  const txCount = hasTransactions
    ? ((doc.extracted_data as Record<string, unknown>).transaction_ids as string[]).length
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-[#E1E1E1] bg-white shadow-xl p-6">
        <h3 className="font-bold text-gray-900 mb-1">Delete document?</h3>
        <p className="text-sm text-gray-500 mb-5">
          <span className="font-medium text-gray-700">{doc.file_name}</span> will be permanently removed.
        </p>

        {hasTransactions && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-5">
            <p className="text-sm font-medium text-amber-800 mb-0.5">
              {txCount} transaction{txCount === 1 ? "" : "s"} from this document
            </p>
            <p className="text-xs text-amber-600">
              Would you like to keep them in your records or delete them too?
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {hasTransactions && (
            <Button
              variant="outline"
              onClick={() => onConfirm(false)}
              loading={loading}
              disabled={loading}
              className="w-full"
            >
              Delete document, keep transactions
            </Button>
          )}
          <Button
            onClick={() => onConfirm(hasTransactions ? true : false)}
            loading={loading}
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white border-red-500"
          >
            {hasTransactions
              ? `Delete document + ${txCount} transaction${txCount === 1 ? "" : "s"}`
              : "Delete document"}
          </Button>
          <Button variant="ghost" onClick={onCancel} disabled={loading} className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DocumentsClient({ initialDocuments }: DocumentsClientProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [viewing, setViewing] = useState<Document | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Document | null>(null);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function confirmDelete(deleteTransactions: boolean) {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/documents/${pendingDelete.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteTransactions }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Delete failed");
        return;
      }
      const result = await res.json();
      setDocuments((prev) => prev.filter((d) => d.id !== pendingDelete.id));
      const txMsg = deleteTransactions && result.deletedTransactions > 0
        ? ` and ${result.deletedTransactions} transaction${result.deletedTransactions === 1 ? "" : "s"}`
        : "";
      toast.success(`"${pendingDelete.file_name}"${txMsg} deleted`);
      setPendingDelete(null);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documents", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Upload failed");
        return;
      }
      const { document } = await res.json();
      setDocuments((prev) => [document, ...prev]);
      toast.success(`Extracted data from "${file.name}"`);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }

  return (
    <>
      {viewing && <ExtractedView doc={viewing} onClose={() => setViewing(null)} />}
      {pendingDelete && (
        <DeleteModal
          doc={pendingDelete}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
          loading={deleting}
        />
      )}

      <div className="space-y-5">
        {/* Upload zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-all ${
            dragging
              ? "border-[#3C366B] bg-[#EAE6F7]"
              : "border-[#E1E1E1] hover:border-[#3C366B]/40 hover:bg-gray-50"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-[#3C366B]" />
              <p className="text-sm text-gray-500">Processing document with AI...</p>
            </div>
          ) : (
            <>
              <Upload className={`h-8 w-8 mb-2 ${dragging ? "text-[#3C366B]" : "text-gray-300"}`} />
              <p className="text-sm font-medium text-gray-600">
                Drop a file or click to upload
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PDF, images, invoices, receipts — AI will extract the data
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.txt,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
        </div>

        {/* Document grid */}
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-gray-200 mb-3" />
            <p className="font-medium text-gray-500">No documents yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Upload a receipt, invoice, or PDF to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {documents.map((doc) => {
              const Icon = FILE_ICONS[doc.file_type] ?? File;
              const conf = doc.confidence ? classifyConfidenceLabel(doc.confidence) : null;
              const extractedAmount = doc.extracted_data?.amount as number | undefined;

              return (
                <div
                  key={doc.id}
                  className="rounded-xl border border-[#E1E1E1] bg-white p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAE6F7]">
                        <Icon className="h-4.5 w-4.5 text-[#3C366B]" style={{ width: 18, height: 18 }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                          {doc.file_name}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {formatDate(doc.created_at)}
                        </p>
                      </div>
                    </div>
                    <DocStatusBadge status={doc.status} />
                  </div>

                  {doc.status === "done" && doc.extracted_data && (
                    <div className="space-y-1.5 text-sm mb-3">
                      {(doc.extracted_data.vendor as string | undefined) && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Vendor</span>
                          <span className="font-medium text-gray-900 truncate max-w-[120px]">
                            {doc.extracted_data.vendor as string}
                          </span>
                        </div>
                      )}
                      {extractedAmount !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Amount</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(extractedAmount)}
                          </span>
                        </div>
                      )}
                      {doc.category && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Category</span>
                          <Badge variant="default" className="text-[10px]">
                            {doc.category}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}

                  {conf && (
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-400">Confidence</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${conf.color}`}>
                        {conf.label}
                      </span>
                    </div>
                  )}

                  {doc.status === "processing" && (
                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-3">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      AI extraction in progress...
                    </div>
                  )}

                  {doc.status === "failed" && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">
                      <XCircle className="h-3 w-3" />
                      Extraction failed
                    </div>
                  )}

                  <div className="flex gap-2">
                    {doc.status === "done" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewing(doc)}
                        className="flex-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View data
                      </Button>
                    )}
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="ghost" size="sm" className="w-full">
                          Open file
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingDelete(doc)}
                      loading={deleting && pendingDelete?.id === doc.id}
                      disabled={deleting && pendingDelete?.id === doc.id}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

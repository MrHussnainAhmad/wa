"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { createBooking } from "@/app/admin/actions";

export function BookingForm({
  boards,
  cancelHref = "/admin/bookings",
}: {
  boards: Array<{ id: string; label: string }>;
  cancelHref?: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [contractUrl, setContractUrl] = useState("");
  const [fileLabel, setFileLabel] = useState("No file chosen");

  async function onUpload(file: File | null) {
    if (!file) {
      setFileLabel("No file chosen");
      return;
    }
    setFileLabel(file.name);
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("kind", "contract");
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setContractUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setFileLabel("No file chosen");
      setContractUrl("");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("contractFileUrl", contractUrl);
    try {
      await createBooking(formData);
      router.push("/admin/bookings");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      <div>
        <Label>Board</Label>
        <Select name="boardId" required>
          {boards.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>Client name</Label>
        <Input name="clientName" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Start</Label>
          <Input name="startDate" type="date" required />
        </div>
        <div>
          <Label>End</Label>
          <Input name="endDate" type="date" required />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Agreed price</Label>
          <Input name="agreedPrice" type="number" required />
        </div>
        <div>
          <Label>Deposit</Label>
          <Select name="depositStatus" defaultValue="PENDING">
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
          </Select>
        </div>
      </div>
      <div>
        <Label>Contract file</Label>
        <p className="mb-2 text-xs text-stone-400">
          Recommended: <span className="text-stone-200">PDF</span> (or DOC/DOCX),
          under <span className="text-stone-200">10 MB</span>. Optional.
        </p>
        <input
          ref={fileRef}
          id="booking-contract"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,image/*"
          className="sr-only"
          onChange={(e) => onUpload(e.target.files?.[0] || null)}
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex h-11 items-center border border-stone-600 bg-stone-900 px-4 text-sm font-semibold text-stone-100 hover:border-amber-500/60 hover:bg-stone-800 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Choose file"}
          </button>
          <span className="text-sm text-stone-400">{fileLabel}</span>
        </div>
        {contractUrl ? (
          <p className="mt-2 text-xs text-emerald-400">Contract uploaded</p>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" disabled={loading || uploading}>
          {loading ? "Saving…" : "Create booking"}
        </Button>
        <Link href={cancelHref}>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}

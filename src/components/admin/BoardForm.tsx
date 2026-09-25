"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";

type Photo = { url: string; publicId: string; sortOrder: number };

export function BoardForm({
  action,
  initial,
  submitLabel = "Save board",
  cancelHref = "/admin/boards",
}: {
  action: (formData: FormData) => Promise<void>;
  initial?: {
    city: string;
    address: string;
    latitude: number;
    longitude: number;
    size: string;
    type: string;
    dailyTraffic: number;
    pricePerMonth: number;
    photos: Photo[];
  };
  submitLabel?: string;
  cancelHref?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>(initial?.photos || []);
  const [uploading, setUploading] = useState(false);
  const [fileLabel, setFileLabel] = useState("No file chosen");
  const [error, setError] = useState("");

  async function onUpload(files: FileList | null) {
    if (!files?.length) {
      setFileLabel("No file chosen");
      return;
    }
    setFileLabel(
      files.length === 1 ? files[0].name : `${files.length} files selected`
    );
    setUploading(true);
    setError("");
    try {
      const next = [...photos];
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        body.append("kind", "image");
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        next.push({
          url: data.url,
          publicId: data.publicId,
          sortOrder: next.length,
        });
      }
      setPhotos(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onSubmit(formData: FormData) {
    formData.set("photosJson", JSON.stringify(photos));
    await action(formData);
  }

  return (
    <form action={onSubmit} className="max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>City</Label>
          <Input name="city" defaultValue={initial?.city} required />
        </div>
        <div>
          <Label>Type</Label>
          <Select name="type" defaultValue={initial?.type || "STATIC"}>
            <option value="STATIC">Static</option>
            <option value="DIGITAL">Digital</option>
          </Select>
        </div>
      </div>
      <div>
        <Label>Address</Label>
        <Input name="address" defaultValue={initial?.address} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Latitude</Label>
          <Input
            name="latitude"
            type="number"
            step="any"
            defaultValue={initial?.latitude ?? 0}
            required
          />
        </div>
        <div>
          <Label>Longitude</Label>
          <Input
            name="longitude"
            type="number"
            step="any"
            defaultValue={initial?.longitude ?? 0}
            required
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Size</Label>
          <Input name="size" defaultValue={initial?.size} required />
        </div>
        <div>
          <Label>Daily traffic</Label>
          <Input
            name="dailyTraffic"
            type="number"
            defaultValue={initial?.dailyTraffic ?? 0}
            required
          />
        </div>
        <div>
          <Label>Price / month</Label>
          <Input
            name="pricePerMonth"
            type="number"
            defaultValue={initial?.pricePerMonth ?? 0}
            required
          />
        </div>
      </div>

      <div>
        <Label>Photos</Label>
        <p className="mb-2 text-xs text-stone-400">
          Recommended:{" "}
          <span className="text-stone-200">1600 × 900 px</span> (16:9 landscape),
          JPG/WebP, under 2 MB. Min{" "}
          <span className="text-stone-200">1200 × 675 px</span>.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          id="board-photos"
          onChange={(e) => onUpload(e.target.files)}
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex h-11 items-center border border-stone-600 bg-stone-900 px-4 text-sm font-semibold text-stone-100 hover:border-amber-500/60 hover:bg-stone-800 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Choose files"}
          </button>
          <span className="text-sm text-stone-400">{fileLabel}</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {photos.map((p, i) => (
            <div key={p.publicId + i} className="relative border border-stone-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" className="aspect-video w-full object-cover" />
              <button
                type="button"
                className="absolute right-1 top-1 bg-black/70 px-1 text-xs text-white"
                onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" disabled={uploading}>
          {submitLabel}
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

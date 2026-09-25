import Image from "next/image";
import Link from "next/link";
import { formatMoney, formatTraffic } from "@/lib/utils";
import { optimizedImageUrl } from "@/lib/cloudinary";
import { StatusBadge } from "@/components/ui/StatusBadge";

export type BoardCardData = {
  id: string;
  city: string;
  address: string;
  type: string;
  dailyTraffic: number;
  pricePerMonth: number;
  status: string;
  size: string;
  photoUrl?: string;
  currency?: string;
};

export function BoardCard({ board }: { board: BoardCardData }) {
  const img =
    board.photoUrl ||
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80";

  const src = optimizedImageUrl(img, { width: 800 });
  const isUnsplash = src.includes("images.unsplash.com");

  return (
    <Link
      href={`/boards/${board.id}`}
      className="group block overflow-hidden border border-stone-800 bg-stone-900/40 transition hover:border-amber-500/50"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-800">
        <Image
          src={src}
          alt={`${board.city} billboard`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
          unoptimized={isUnsplash}
        />
        <div className="absolute left-3 top-3">
          <StatusBadge status={board.status} />
        </div>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-[family-name:var(--font-display)] text-xl text-white">
              {board.city}
            </h3>
            <p className="text-sm text-stone-400">{board.address}</p>
          </div>
          <span className="text-xs uppercase tracking-wider text-amber-400">
            {board.type}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-stone-300">
          <span>{formatTraffic(board.dailyTraffic)} / day</span>
          <span className="font-semibold text-white">
            {formatMoney(board.pricePerMonth, board.currency)}
            <span className="font-normal text-stone-400">/mo</span>
          </span>
        </div>
        <p className="text-xs text-stone-500">{board.size}</p>
      </div>
    </Link>
  );
}

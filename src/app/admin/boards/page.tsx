import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Board } from "@/models";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { deleteBoard } from "@/app/admin/actions";
import { formatMoney } from "@/lib/utils";
import { getSettings } from "@/lib/settings";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function AdminBoardsPage() {
  await connectDB();
  const [boards, settings] = await Promise.all([
    Board.find().sort({ city: 1 }).lean(),
    getSettings(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">
          Boards
        </h1>
        <Link href="/admin/boards/new">
          <Button>Add board</Button>
        </Link>
      </div>
      <div className="overflow-x-auto border border-stone-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-900 text-stone-400">
            <tr>
              <th className="px-3 py-2">City</th>
              <th className="px-3 py-2">Address</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {boards.map((b) => (
              <tr key={String(b._id)} className="border-t border-stone-800">
                <td className="px-3 py-2 text-white">{b.city}</td>
                <td className="px-3 py-2">{b.address}</td>
                <td className="px-3 py-2">{b.type}</td>
                <td className="px-3 py-2">
                  {formatMoney(b.pricePerMonth, settings.currency)}
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={b.status} />
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/boards/${b._id}/edit`}
                      className="text-amber-400 hover:underline"
                    >
                      Edit
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteBoard(String(b._id));
                      }}
                    >
                      <button type="submit" className="text-red-400 hover:underline">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Board } from "@/models";
import { BoardForm } from "@/components/admin/BoardForm";
import { updateBoard } from "@/app/admin/actions";

export default async function EditBoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();
  const board = await Board.findById(id).lean();
  if (!board) notFound();

  async function action(formData: FormData) {
    "use server";
    await updateBoard(id, formData);
    redirect("/admin/boards");
  }

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">
        Edit board
      </h1>
      <BoardForm
        action={action}
        initial={{
          city: board.city,
          address: board.address,
          latitude: board.latitude,
          longitude: board.longitude,
          size: board.size,
          type: board.type,
          dailyTraffic: board.dailyTraffic,
          pricePerMonth: board.pricePerMonth,
          photos: (board.photos || []).map(
            (
              p: { url: string; publicId?: string; sortOrder?: number },
              i: number
            ) => ({
              url: p.url,
              publicId: p.publicId || `p-${i}`,
              sortOrder: p.sortOrder ?? i,
            })
          ),
        }}
      />
    </div>
  );
}

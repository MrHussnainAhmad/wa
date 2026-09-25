import { redirect } from "next/navigation";
import { BoardForm } from "@/components/admin/BoardForm";
import { createBoard } from "@/app/admin/actions";

export default function NewBoardPage() {
  async function action(formData: FormData) {
    "use server";
    const id = await createBoard(formData);
    redirect(`/admin/boards/${id}/edit`);
  }

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">
        New board
      </h1>
      <BoardForm action={action} submitLabel="Create board" />
    </div>
  );
}

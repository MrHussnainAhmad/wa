import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { AdminUser } from "@/models";
import { createSalesRep, deleteSalesRep } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/admin");

  await connectDB();
  const users = await AdminUser.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-8">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">
        Users
      </h1>

      <form
        action={async (fd) => {
          "use server";
          await createSalesRep(fd);
        }}
        className="max-w-md space-y-3 border border-stone-800 p-4"
      >
        <h2 className="font-semibold">Add sales rep</h2>
        <div>
          <Label>Name</Label>
          <Input name="name" />
        </div>
        <div>
          <Label>Email</Label>
          <Input name="email" type="email" required />
        </div>
        <div>
          <Label>Password</Label>
          <Input name="password" type="password" required minLength={6} />
        </div>
        <Button type="submit">Create</Button>
      </form>

      <div className="overflow-x-auto border border-stone-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-900 text-stone-400">
            <tr>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={String(u._id)} className="border-t border-stone-800">
                <td className="px-3 py-2 text-white">{u.email}</td>
                <td className="px-3 py-2">{u.name || "—"}</td>
                <td className="px-3 py-2">{u.role}</td>
                <td className="px-3 py-2">
                  {u.role === "SALES_REP" ? (
                    <form
                      action={async () => {
                        "use server";
                        await deleteSalesRep(String(u._id));
                      }}
                    >
                      <button type="submit" className="text-red-400">
                        Remove
                      </button>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

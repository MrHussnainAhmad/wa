import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/boards", label: "Boards" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/bookings/calendar", label: "Calendar" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/faqs", label: "FAQs" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <AdminShell
      email={session.user.email}
      role={session.user.role}
      isSuper={session.user.role === "SUPER_ADMIN"}
      links={links}
    >
      {children}
    </AdminShell>
  );
}

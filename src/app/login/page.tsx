import { Suspense } from "react";
import Link from "next/link";
import { StaffLoginForm } from "@/components/admin/StaffLoginForm";
import { BRAND } from "@/lib/brand";

export default function SalesLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-950 px-4">
      <Link
        href="/"
        className="text-center font-[family-name:var(--font-display)] text-4xl text-white sm:text-5xl"
      >
        {BRAND.name}
      </Link>
      <div className="mt-8 w-full">
        <Suspense>
          <StaffLoginForm
            allowedRole="SALES_REP"
            title="Sales team sign in"
          />
        </Suspense>
      </div>
      <p className="mt-6 text-center text-xs text-stone-500">
        Admin?{" "}
        <Link href="/login/admin" className="text-amber-400 hover:underline">
          Use admin login
        </Link>
      </p>
    </div>
  );
}

// app/admin/finance/page.tsx
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";

import SummaryCards from "./ui/SummaryCards";
import TxForm from "./ui/TxForm";
import TxTable from "./ui/TxTable";

export const metadata = { title: "Robonarim | Finance (Admin)" };

export default async function FinancePage() {
  // ✅ حارس سيرفري: يمنع الوصول إن لم يكن Admin
  const sess = await getSessionFromCookies();
  if (!sess || (sess.role || "").toLowerCase() !== "admin") {
    redirect(`/login?next=${encodeURIComponent("/admin/finance")}`);
  }

  // بإمكانك لاحقاً تمرير تاريخ بداية/نهاية من searchParams
  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">لوحة المحاسبة (Admin)</h1>
        </header>

        <SummaryCards />

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <TxForm />
          </div>
          <div className="md:col-span-2">
            <TxTable />
          </div>
        </div>
      </div>
    </div>
  );
}

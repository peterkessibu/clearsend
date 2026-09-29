import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav userName={user.name || user.email} />
      <div className="border-b border-slate-200 bg-white">
        <p className="mx-auto max-w-5xl px-4 py-2 text-center text-xs font-medium text-slate-600 sm:px-6">
          ClearSend does not hold funds. Quotes are estimates. PAPSS-aligned —
          not live PAPSS.
        </p>
      </div>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}

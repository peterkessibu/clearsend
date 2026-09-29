import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav userName={session.user.name || session.user.email} />
      <div className="border-b border-amber-200 bg-amber-50">
        <p className="mx-auto max-w-5xl px-4 py-2 text-center text-xs font-medium text-amber-900 sm:px-6">
          DEMO / sandbox mode — balances and transfers are not live settlement.
          MoMo keys absent → SandboxMockProvider.
        </p>
      </div>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type TabIcon = (props: { active: boolean }) => React.ReactElement;

type Tab = {
  href: string;
  label: string;
  exact?: boolean;
  icon: TabIcon;
};

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

const tabs: Tab[] = [
  { href: "/dashboard", label: "Home", exact: true, icon: HomeIcon },
  { href: "/dashboard/send", label: "Send", icon: SendIcon },
  { href: "/dashboard/transfers", label: "Transfers", icon: TransfersIcon },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
];

export function DashboardShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative min-h-dvh bg-[#f4f7f6] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-teal-900/5 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 text-sm font-bold text-white shadow-sm shadow-teal-700/25">
              CS
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold tracking-tight text-slate-900">
                ClearSend
              </span>
              <span className="hidden text-[11px] font-medium text-teal-700 sm:block">
                West Africa FX clarity
              </span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span
              className="hidden max-w-[160px] truncate text-xs font-medium text-slate-500 sm:inline"
              title={userName}
            >
              {userName}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-amber-200/60 bg-gradient-to-r from-amber-50 via-white to-teal-50">
        <p className="mx-auto max-w-5xl px-4 py-2 text-center text-[11px] font-medium leading-relaxed text-slate-600 sm:px-6 sm:text-xs">
          ClearSend does not hold funds. Quotes are estimates. PAPSS-aligned —
          not live PAPSS.
        </p>
      </div>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-6 sm:px-6 sm:pt-8">
        {children}
      </main>

      <nav
        aria-label="Dashboard"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/90 bg-white/95 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-md"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="mx-auto grid max-w-5xl grid-cols-4 px-1 pt-1.5 sm:px-2">
          {tabs.map((tab) => {
            const active = isActive(pathname, tab.href, tab.exact);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                aria-label={tab.label}
                className={`group relative flex flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[11px] font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:text-xs ${
                  active
                    ? "text-teal-800"
                    : "text-slate-500 hover:text-teal-800"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-2xl transition ${
                    active
                      ? "bg-teal-700 text-white shadow-md shadow-teal-700/30"
                      : "bg-transparent text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-800"
                  }`}
                >
                  <Icon active={active} />
                </span>
                <span className={active ? "text-teal-800" : undefined}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
    </svg>
  );
}

function SendIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4.5 12h9M12 6.5 17.5 12 12 17.5"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 7.5v9"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round"
        opacity={0.55}
      />
    </svg>
  );
}

function TransfersIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 7h11M14 4l4 3-4 3M17 17H6M10 14l-4 3 4 3"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
      <path
        d="M12 3.5v2.2M12 18.3v2.2M4.9 6.5l1.6 1.6M17.5 15.9l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.9 17.5l1.6-1.6M17.5 8.1l1.6-1.6"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round"
      />
    </svg>
  );
}

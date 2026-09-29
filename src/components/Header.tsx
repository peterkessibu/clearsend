"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "#quote", label: "Get quote" },
  { href: "#how", label: "How it works" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 text-sm font-bold text-white shadow-sm shadow-teal-600/30">
            CS
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight text-slate-900">
              ClearSend
            </div>
            <div className="text-[11px] font-medium text-teal-700">
              West Africa FX clarity
            </div>
          </div>
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-600 transition hover:text-teal-700"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 transition hover:text-teal-700"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
          >
            Get started
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/login"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="mt-1 rounded-full bg-teal-700 px-3 py-2.5 text-center text-sm font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

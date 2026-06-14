"use client";

// App shell — turns the single scroll into a real app: sticky top bar with a live
// balance chip + a thumb-reach bottom tab bar, framed as a phone on desktop.
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const TABS = [
  { href: "/", label: "Wallet", icon: WalletIcon },
  { href: "/tank", label: "Tank", icon: GaugeIcon },
  { href: "/ask", label: "Ask", icon: ChatIcon },
  { href: "/setup", label: "Setup", icon: GearIcon },
] as const;

export function AppShell({
  children,
  subsidyRinggit,
  persona = "aisyah",
}: {
  children: ReactNode;
  subsidyRinggit?: number;
  persona?: "aisyah" | "rahman";
}) {
  const pathname = usePathname();
  const qs = persona === "rahman" ? "?p=rahman" : "";
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div className="app-frame relative mx-auto flex min-h-screen w-full max-w-[440px] flex-col">
      <header className="app-bar sticky top-0 z-20 flex flex-col gap-2 px-5 py-3">
        <div className="flex items-center justify-between">
          <Link href={`/${qs}`} className="text-lg font-extrabold uppercase tracking-[0.18em]">
            JimatJalan
          </Link>
          {subsidyRinggit != null && (
            <span className="flex items-center gap-2 rounded-full px-3 py-1 text-sm" style={{ background: "var(--panel-inset)", border: "1px solid var(--edge)" }}>
              <span className="led-dot" style={{ color: "var(--led-green)" }} />
              <span className="seg font-semibold" style={{ color: "var(--ink)" }}>
                RM{subsidyRinggit.toFixed(0)}
              </span>
            </span>
          )}
        </div>
        {/* Demo persona switch — commuter (Aisyah) vs the e-hailing wedge (Rahman). */}
        <div className="flex gap-1 self-start rounded-full p-0.5" style={{ background: "var(--panel-inset)", border: "1px solid var(--edge)" }}>
          {[
            { p: "aisyah", label: "Aisyah · commuter", href: pathname },
            { p: "rahman", label: "Rahman · e-hailing", href: `${pathname}?p=rahman` },
          ].map((o) => (
            <Link
              key={o.p}
              href={o.href}
              className="rounded-full px-3 py-1 text-[11px] font-semibold transition-colors"
              style={
                persona === o.p
                  ? { background: "var(--accent)", color: "#2a1d05" }
                  : { color: "var(--ink-dim)" }
              }
            >
              {o.label}
            </Link>
          ))}
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center gap-4 px-4 pb-28 pt-4">{children}</main>

      <nav className="app-nav fixed bottom-0 left-1/2 z-30 w-full max-w-[440px] -translate-x-1/2 px-3 pb-3 pt-2">
        <div
          className="flex items-stretch justify-around rounded-2xl px-1 py-1"
          style={{ background: "var(--card)", border: "1px solid var(--edge)", boxShadow: "0 -2px 24px -16px rgba(20,45,32,0.5)" }}
        >
          {TABS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={`${href}${qs}`}
                aria-current={active ? "page" : undefined}
                className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 transition-colors"
                style={{ color: active ? "var(--led-amber)" : "var(--ink-dim)" }}
              >
                <Icon active={active} />
                <span className="label text-[10px]">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function WalletIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v1" />
      <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H5a2 2 0 0 1-2-2z" />
      <circle cx="16.5" cy="13" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
function GaugeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 14a6 6 0 0 1 6-6" opacity="0" />
      <path d="M4 18a8 8 0 1 1 16 0" />
      <path d="M12 18l4-4" />
    </svg>
  );
}
function ChatIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12z" />
    </svg>
  );
}
function GearIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7.7 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1.1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H2a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1.1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H8a1.6 1.6 0 0 0 1-1.5V2a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V8a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
    </svg>
  );
}

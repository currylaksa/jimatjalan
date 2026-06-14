// Per-browser demo state (Aisyah's logged fills + re-anchor), stored in a cookie
// so it survives serverless instance recycling and isolates each judge's session.
// The vehicle/config/profile stay seed (static). Reads work in server components;
// writes only in server actions / route handlers.
import { cookies } from "next/headers";
import type { Fill, Anchor, DrivingStyle } from "@/domain/types";

const COOKIE = "jj_session";
const MAX_FILLS = 12;

export interface Session {
  fills: Fill[]; // extra fills logged via the UI (on top of the seed history)
  anchor?: Anchor; // re-anchor override
  drivingStyle?: DrivingStyle; // self-reported (module 3)
}

export async function readSession(): Promise<Session> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return { fills: [] };
  try {
    const s = JSON.parse(raw) as Session;
    return { fills: Array.isArray(s.fills) ? s.fills : [], anchor: s.anchor, drivingStyle: s.drivingStyle };
  } catch {
    return { fills: [] };
  }
}

/** Server-action / route-handler only (cookies are read-only in components). */
export async function writeSession(s: Session): Promise<void> {
  (await cookies()).set(COOKIE, JSON.stringify({ ...s, fills: s.fills.slice(-MAX_FILLS) }), {
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
  });
}

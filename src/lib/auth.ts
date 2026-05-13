import "server-only";
import { cookies } from "next/headers";

const COOKIE_NAME = "bav_session";

export async function isAuthenticated(): Promise<boolean> {
  const expected = process.env.TRIP_PASSWORD;
  if (!expected) return false;
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === expected;
}

export async function signIn(password: string): Promise<boolean> {
  const expected = process.env.TRIP_PASSWORD;
  if (!expected || password !== expected) return false;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });
  return true;
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

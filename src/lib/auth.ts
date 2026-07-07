import { cookies } from "next/headers";
import crypto from "crypto";

function getExpectedToken(): string {
  return crypto
    .createHmac("sha256", process.env.ADMIN_PASSWORD!)
    .update("admin-session-v1")
    .digest("hex");
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  if (!token?.value) return false;
  const expected = getExpectedToken();
  const a = Buffer.from(token.value);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

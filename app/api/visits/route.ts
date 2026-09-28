import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/** Bumps the public visitor counter and returns the new total.
 *  503 when Supabase isn't configured — the footer then hides the counter. */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ count: null }, { status: 503 });
  }
  try {
    const sb = createClient(url, key);
    const { data, error } = await sb.rpc("bump_visits");
    if (error) throw error;
    return NextResponse.json({ count: data as number });
  } catch {
    return NextResponse.json({ count: null }, { status: 503 });
  }
}

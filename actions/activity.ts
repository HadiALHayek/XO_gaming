"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeSyrianPhone } from "@/lib/reservations/schemas";

export type UserActivityResult =
  | {
      ok: true;
      data: {
        reservations: Array<{
          id: string;
          device_name: string;
          start_time: string;
          end_time: string;
          created_at: string;
        }>;
        downloadRequests: Array<{
          id: string;
          category: string;
          status: string;
          file_name: string;
          created_at: string;
        }>;
        matchReservations: Array<{
          id: string;
          match_title: string;
          seat_number: number;
          created_at: string;
        }>;
      };
    }
  | { ok: false; error: string };

export async function getUserActivity(input: {
  guestToken?: string;
  phone?: string;
}): Promise<UserActivityResult> {
  const guestToken = input.guestToken?.trim() || null;
  const normalizedPhone = input.phone ? normalizeSyrianPhone(input.phone) : null;
  if (!guestToken && !normalizedPhone) {
    return { ok: false, error: "Provide phone number or guest token." };
  }

  const supabase = await createSupabaseServerClient();
  const reservationQuery = supabase
    .from("reservations")
    .select("id,start_time,end_time,created_at,device:devices(name)");
  const downloadQuery = supabase
    .from("download_requests")
    .select("id,category,status,file_name,created_at");
  const matchQuery = supabase
    .from("match_reservations")
    .select("id,seat_number,created_at,match:matches(title)");

  if (guestToken && normalizedPhone) {
    reservationQuery.or(
      `guest_token.eq.${encodeURIComponent(guestToken)},customer_phone.eq.${encodeURIComponent(normalizedPhone)}`,
    );
    downloadQuery.or(
      `guest_token.eq.${encodeURIComponent(guestToken)},customer_phone.eq.${encodeURIComponent(normalizedPhone)}`,
    );
    matchQuery.or(
      `guest_token.eq.${encodeURIComponent(guestToken)},customer_phone.eq.${encodeURIComponent(normalizedPhone)}`,
    );
  } else if (guestToken) {
    reservationQuery.eq("guest_token", guestToken);
    downloadQuery.eq("guest_token", guestToken);
    matchQuery.eq("guest_token", guestToken);
  } else if (normalizedPhone) {
    reservationQuery.eq("customer_phone", normalizedPhone);
    downloadQuery.eq("customer_phone", normalizedPhone);
    matchQuery.eq("customer_phone", normalizedPhone);
  }

  const [
    { data: reservations, error: reservationsError },
    { data: downloads, error: downloadsError },
    { data: matches, error: matchesError },
  ] = await Promise.all([
    reservationQuery.order("created_at", { ascending: false }).limit(20),
    downloadQuery.order("created_at", { ascending: false }).limit(20),
    matchQuery.order("created_at", { ascending: false }).limit(20),
  ]);

  if (reservationsError) return { ok: false, error: reservationsError.message };
  if (downloadsError) return { ok: false, error: downloadsError.message };
  if (matchesError) return { ok: false, error: matchesError.message };

  return {
    ok: true,
    data: {
      reservations: (reservations ?? []).map((row) => ({
        id: row.id as string,
        device_name: Array.isArray(row.device)
          ? ((row.device[0] as { name?: string } | undefined)?.name ?? "Unknown")
          : ((row.device as { name?: string } | null)?.name ?? "Unknown"),
        start_time: row.start_time as string,
        end_time: row.end_time as string,
        created_at: row.created_at as string,
      })),
      downloadRequests: (downloads ?? []).map((row) => ({
        id: row.id as string,
        category: row.category as string,
        status: row.status as string,
        file_name: row.file_name as string,
        created_at: row.created_at as string,
      })),
      matchReservations: (matches ?? []).map((row) => ({
        id: row.id as string,
        match_title: Array.isArray(row.match)
          ? ((row.match[0] as { title?: string } | undefined)?.title ?? "Unknown match")
          : ((row.match as { title?: string } | null)?.title ?? "Unknown match"),
        seat_number: row.seat_number as number,
        created_at: row.created_at as string,
      })),
    },
  };
}

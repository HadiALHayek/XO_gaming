import { NextResponse } from "next/server";
import { listBlockedSlotsByRange, listReservationsByRange } from "@/lib/supabase/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("deviceId");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!deviceId || !start || !end) {
    return NextResponse.json(
      { ok: false, error: "Missing deviceId, start, or end." },
      { status: 400 },
    );
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return NextResponse.json(
      { ok: false, error: "Invalid date range." },
      { status: 400 },
    );
  }

  try {
    const [reservations, blocked] = await Promise.all([
      listReservationsByRange(deviceId, startDate.toISOString(), endDate.toISOString()),
      listBlockedSlotsByRange(deviceId, startDate.toISOString(), endDate.toISOString()),
    ]);

    const events = [
      ...reservations.map((r) => ({
        id: `r-${r.id}`,
        title: "Reserved",
        start: r.start_time,
        end: r.end_time,
        type: "RESERVATION" as const,
      })),
      ...blocked.map((b) => ({
        id: `b-${b.id}`,
        title: `Maintenance: ${b.reason}`,
        start: b.start_time,
        end: b.end_time,
        type: "BLOCKED" as const,
      })),
    ];

    return NextResponse.json({ ok: true, events });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

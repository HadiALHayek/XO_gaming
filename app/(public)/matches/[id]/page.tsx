import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MatchSeatPicker } from "@/components/matches/MatchSeatPicker";
import { formatDateTime } from "@/lib/dates";
import { getMatchById, listMatchReservations } from "@/lib/supabase/data";

export const dynamic = "force-dynamic";

export default async function MatchSeatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [match, reservations] = await Promise.all([
    getMatchById(id).catch(() => null),
    listMatchReservations(id).catch(() => []),
  ]);

  if (!match) notFound();

  const reservedSeats = reservations.map((r) => r.seat_number);

  return (
    <div className="container space-y-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">{match.title}</h1>
          <p className="text-sm text-muted-foreground">{formatDateTime(match.match_date)}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/matches">Back to matches</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-6 p-6">
          <p className="text-sm text-muted-foreground">{match.details ?? "No additional details."}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <span className="h-3 w-3 rounded-sm border border-white/15 bg-white/5" />
              Available
            </span>
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <span className="h-3 w-3 rounded-sm border border-neon-purple/60 bg-neon-purple/30" />
              Selected
            </span>
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <span className="h-3 w-3 rounded-sm border border-red-400/40 bg-red-500/20" />
              Reserved
            </span>
          </div>
          <MatchSeatPicker matchId={match.id} reservedSeats={reservedSeats} />
        </CardContent>
      </Card>
    </div>
  );
}

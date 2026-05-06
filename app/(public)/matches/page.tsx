import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listMatches, listMatchReservations } from "@/lib/supabase/data";
import { formatDateTime } from "@/lib/dates";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Matches Reservations",
};

export default async function MatchesPage() {
  const matches = await listMatches().catch(() => []);
  const seatCounts = await Promise.all(
    matches.map(async (match) => ({
      id: match.id,
      count: (await listMatchReservations(match.id).catch(() => [])).length,
    })),
  );
  const countsById = Object.fromEntries(seatCounts.map((item) => [item.id, item.count]));

  return (
    <div className="container space-y-6 py-12">
      <div>
        <h1 className="font-display text-3xl font-bold md:text-4xl">Matches reservation</h1>
        <p className="text-sm text-muted-foreground">
          Choose a match, then select one or more seats.
        </p>
      </div>

      {matches.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No matches available right now.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {matches.map((match) => (
            <Card key={match.id}>
              <CardContent className="space-y-3 p-5">
                <div>
                  <h2 className="text-lg font-semibold">{match.title}</h2>
                  <p className="text-xs text-muted-foreground">{formatDateTime(match.match_date)}</p>
                </div>
                <p className="text-sm text-muted-foreground">{match.details ?? "No additional details."}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Reserved: {countsById[match.id] ?? 0} / 20 seats
                  </p>
                  <Button asChild size="sm">
                    <Link href={`/matches/${match.id}`}>Select seats</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

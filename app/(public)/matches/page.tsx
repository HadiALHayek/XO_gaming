import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listMatches, listMatchReservations } from "@/lib/supabase/data";
import { formatDateTime } from "@/lib/dates";
import { getDictionary } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Matches Reservations",
};

export default async function MatchesPage() {
  const [{ t }, matches] = await Promise.all([getDictionary(), listMatches().catch(() => [])]);
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
        <h1 className="font-display text-3xl font-bold md:text-4xl">{t.matches.title}</h1>
        <p className="text-sm text-muted-foreground">{t.matches.subtitle}</p>
      </div>

      {matches.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            {t.matches.noMatches}
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
                <p className="text-sm text-muted-foreground">{match.details ?? t.matches.noDetails}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {t.matches.reservedCount}: {countsById[match.id] ?? 0} / 20 {t.matches.seats}
                  </p>
                  <Button asChild size="sm">
                    <Link href={`/matches/${match.id}`}>{t.matches.selectSeats}</Link>
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

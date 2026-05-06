import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MatchFormDialog } from "@/components/admin/MatchFormDialog";
import { MatchActions } from "@/components/admin/MatchActions";
import { listMatches, listMatchReservations } from "@/lib/supabase/data";
import { formatDateTime } from "@/lib/dates";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Matches",
};

export default async function AdminMatchesPage() {
  const matches = await listMatches().catch(() => []);
  const reservationCounts = await Promise.all(
    matches.map(async (match) => ({
      id: match.id,
      count: (await listMatchReservations(match.id).catch(() => [])).length,
    })),
  );
  const countsById = Object.fromEntries(
    reservationCounts.map((item) => [item.id, item.count]),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Matches</h1>
          <p className="text-sm text-muted-foreground">
            Add match details and open seat reservations for users.
          </p>
        </div>
        <MatchFormDialog
          trigger={
            <Button>
              <Plus className="h-4 w-4" />
              New match
            </Button>
          }
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {matches.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No matches yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">Title</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Reserved seats</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match) => (
                    <tr key={match.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="font-medium">{match.title}</div>
                        <div className="text-xs text-muted-foreground">{match.details ?? "No details"}</div>
                      </td>
                      <td className="px-4 py-3">{formatDateTime(match.match_date)}</td>
                      <td className="px-4 py-3">{countsById[match.id] ?? 0} / 20</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/matches/${match.id}`}>Open seats</Link>
                          </Button>
                          <MatchActions matchId={match.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

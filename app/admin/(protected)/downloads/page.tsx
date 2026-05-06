import { Card, CardContent } from "@/components/ui/card";
import { DownloadPriceCalculator } from "@/components/admin/DownloadPriceCalculator";
import { listDownloadRequests } from "@/lib/supabase/data";
import { formatDateTime } from "@/lib/dates";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Download requests",
};

export default async function AdminDownloadsPage() {
  const requests = await listDownloadRequests().catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Download Requests</h1>
        <p className="text-sm text-muted-foreground">
          Requests submitted by users for games, series, and films.
        </p>
      </div>

      <DownloadPriceCalculator />

      <Card>
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No download requests yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">Category</th>
                    <th className="px-4 py-3 text-left font-medium">File</th>
                    <th className="px-4 py-3 text-left font-medium">Customer</th>
                    <th className="px-4 py-3 text-left font-medium">Phone</th>
                    <th className="px-4 py-3 text-left font-medium">Requested at</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3">{request.category}</td>
                      <td className="px-4 py-3 font-medium">{request.file_name}</td>
                      <td className="px-4 py-3">{request.customer_name}</td>
                      <td className="px-4 py-3">{request.customer_phone}</td>
                      <td className="px-4 py-3">{formatDateTime(request.created_at)}</td>
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

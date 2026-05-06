import { Card, CardContent } from "@/components/ui/card";
import { DownloadPriceCalculator } from "@/components/admin/DownloadPriceCalculator";
import { DownloadRequestActions } from "@/components/admin/DownloadRequestActions";
import { getDictionary } from "@/lib/i18n/server";
import { listDownloadRequests } from "@/lib/supabase/data";
import { formatDateTime } from "@/lib/dates";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Download requests",
};

export default async function AdminDownloadsPage() {
  const [{ t }, requests] = await Promise.all([getDictionary(), listDownloadRequests().catch(() => [])]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">{t.adminDownloads.title}</h1>
        <p className="text-sm text-muted-foreground">{t.adminDownloads.subtitle}</p>
      </div>

      <DownloadPriceCalculator />

      <Card>
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              {t.adminDownloads.noRequests}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">{t.adminDownloads.category}</th>
                    <th className="px-4 py-3 text-left font-medium">{t.adminDownloads.file}</th>
                    <th className="px-4 py-3 text-left font-medium">{t.adminDownloads.customer}</th>
                    <th className="px-4 py-3 text-left font-medium">{t.adminDownloads.phone}</th>
                    <th className="px-4 py-3 text-left font-medium">{t.adminDownloads.status}</th>
                    <th className="px-4 py-3 text-left font-medium">{t.adminDownloads.requestedAt}</th>
                    <th className="px-4 py-3 text-right font-medium">{t.adminDownloads.actions}</th>
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
                      <td className="px-4 py-3">
                        {request.status === "HOLD"
                          ? t.common.hold
                          : request.status === "ON_PROGRESS"
                            ? t.common.onProgress
                            : t.common.finished}
                      </td>
                      <td className="px-4 py-3">{formatDateTime(request.created_at)}</td>
                      <td className="px-4 py-3">
                        <DownloadRequestActions request={request} />
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

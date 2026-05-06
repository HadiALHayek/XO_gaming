import { DownloadRequestForm } from "@/components/downloads/DownloadRequestForm";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = {
  title: "Downloads",
};

export default async function DownloadsPage() {
  const { t } = await getDictionary();
  return (
    <div className="container space-y-6 py-12">
      <div>
        <h1 className="font-display text-3xl font-bold md:text-4xl">{t.downloads.title}</h1>
        <p className="text-sm text-muted-foreground">{t.downloads.subtitle}</p>
      </div>
      <DownloadRequestForm />
    </div>
  );
}

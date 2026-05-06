import { DownloadRequestForm } from "@/components/downloads/DownloadRequestForm";

export const metadata = {
  title: "Downloads",
};

export default function DownloadsPage() {
  return (
    <div className="container space-y-6 py-12">
      <div>
        <h1 className="font-display text-3xl font-bold md:text-4xl">Download Requests</h1>
        <p className="text-sm text-muted-foreground">
          Request games, series, or films. Add file name, your name, and phone number.
        </p>
      </div>
      <DownloadRequestForm />
    </div>
  );
}

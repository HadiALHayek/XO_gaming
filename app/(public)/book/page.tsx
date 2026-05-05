import { BookingForm } from "@/components/booking/BookingForm";
import { getActiveDevices } from "@/lib/queries";
import { getDictionary } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Book a session",
  description: "Reserve gaming PCs and PlayStation 5 stations at XO Gaming.",
};

export default async function BookPage() {
  const [devices, { t }] = await Promise.all([getActiveDevices(), getDictionary()]);

  return (
    <div className="container space-y-8 py-12">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          <span className="gradient-text">{t.book.title}</span>
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t.book.subtitle}
        </p>
      </div>
      <BookingForm devices={devices} />
    </div>
  );
}

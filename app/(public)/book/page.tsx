import { BookingForm } from "@/components/booking/BookingForm";
import { getActiveDevices } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Book a session",
  description: "Reserve gaming PCs and PlayStation 5 stations at NeonArena.",
};

export default async function BookPage() {
  const devices = await getActiveDevices();

  return (
    <div className="container space-y-8 py-12">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          Book your <span className="gradient-text">session</span>
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Pick a device, drag to select a slot on the calendar (or type your
          times), and confirm. Reservations run from 1 to 12 hours.
        </p>
      </div>
      <BookingForm devices={devices} />
    </div>
  );
}

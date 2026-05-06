import { MyActivityPanel } from "@/components/activity/MyActivityPanel";

export const metadata = {
  title: "My Activity",
};

export default function MyActivityPage() {
  return (
    <div className="container space-y-6 py-12">
      <div>
        <h1 className="font-display text-3xl font-bold md:text-4xl">My Activity</h1>
        <p className="text-sm text-muted-foreground">
          View your reservations and requests without login. Your activity is saved automatically
          on this device using cookies.
        </p>
      </div>
      <MyActivityPanel />
    </div>
  );
}

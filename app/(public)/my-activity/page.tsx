import { MyActivityPanel } from "@/components/activity/MyActivityPanel";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = {
  title: "My Activity",
};

export default async function MyActivityPage() {
  const { t } = await getDictionary();
  return (
    <div className="container space-y-6 py-12">
      <div>
        <h1 className="font-display text-3xl font-bold md:text-4xl">{t.activity.title}</h1>
        <p className="text-sm text-muted-foreground">{t.activity.subtitle}</p>
      </div>
      <MyActivityPanel />
    </div>
  );
}

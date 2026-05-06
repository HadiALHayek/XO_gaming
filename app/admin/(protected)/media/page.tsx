import { HomeVideoManager } from "@/components/admin/HomeVideoManager";
import { HomeDrinkManager } from "@/components/admin/HomeDrinkManager";
import { HomeLogoManager } from "@/components/admin/HomeLogoManager";
import {
  getSiteSettings,
  listHomeDrinkImages,
  listHomeLogoImages,
} from "@/lib/supabase/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Homepage media",
};

export default async function AdminMediaPage() {
  const [settings, logos, drinks] = await Promise.all([
    getSiteSettings().catch(() => null),
    listHomeLogoImages().catch(() => []),
    listHomeDrinkImages().catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Homepage Media</h1>
        <p className="text-sm text-muted-foreground">
          Manage the promotional video shown to users on the home page.
        </p>
      </div>

      <HomeVideoManager
        currentUrl={settings?.home_video_url ?? null}
        currentPath={settings?.home_video_path ?? null}
      />
      <HomeLogoManager logos={logos} />
      <HomeDrinkManager drinks={drinks} />
    </div>
  );
}


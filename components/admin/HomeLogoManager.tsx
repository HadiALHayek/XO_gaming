"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { ImageIcon, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { addHomeLogoImage, removeHomeLogoImage } from "@/actions/media";
import type { HomeLogoImage } from "@/types";

function sanitizeFilename(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");
}

export function HomeLogoManager({ logos }: { logos: HomeLogoImage[] }) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  async function uploadLogos() {
    if (selectedFiles.length === 0) {
      toast.error("Please choose at least one image.");
      return;
    }
    const invalid = selectedFiles.find((file) => !file.type.startsWith("image/"));
    if (invalid) {
      toast.error("Only image files are allowed.");
      return;
    }

    startTransition(async () => {
      for (const file of selectedFiles) {
        const filePath = `logos/${Date.now()}-${sanitizeFilename(file.name)}`;
        const { error: uploadError } = await supabase.storage
          .from("game-logos")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });
        if (uploadError) {
          toast.error(uploadError.message);
          return;
        }
        const { data } = supabase.storage.from("game-logos").getPublicUrl(filePath);
        const result = await addHomeLogoImage(filePath, data.publicUrl);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
      }
      toast.success("Logos uploaded.");
      setSelectedFiles([]);
      window.location.reload();
    });
  }

  function deleteLogo(id: string) {
    startTransition(async () => {
      const result = await removeHomeLogoImage(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Logo removed.");
      window.location.reload();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-neon-purple" />
          Game Logos Slider
        </CardTitle>
        <CardDescription>
          Upload multiple game logos. They will auto-flip on the home page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {logos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-muted-foreground">
            No logos uploaded yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {logos.map((logo) => (
              <div key={logo.id} className="space-y-2 rounded-xl border border-white/10 p-3">
                <img
                  src={logo.image_url}
                  alt="Game logo"
                  className="h-28 w-full rounded-lg object-cover"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={isPending}
                  onClick={() => deleteLogo(logo.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <Input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/*"
            multiple
            onChange={(e) => setSelectedFiles(Array.from(e.target.files ?? []))}
          />
          <p className="text-xs text-muted-foreground">
            Supported: PNG, JPG, WEBP, GIF. Multiple files are allowed.
          </p>
        </div>

        <Button onClick={uploadLogos} disabled={isPending || selectedFiles.length === 0}>
          <Upload className="h-4 w-4" />
          Upload logos
        </Button>
      </CardContent>
    </Card>
  );
}

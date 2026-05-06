"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { CupSoda, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { addHomeDrinkImage, removeHomeDrinkImage } from "@/actions/media";
import type { HomeDrinkImage } from "@/types";

function sanitizeFilename(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");
}

export function HomeDrinkManager({ drinks }: { drinks: HomeDrinkImage[] }) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  async function uploadDrinks() {
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
        const filePath = `drinks/${Date.now()}-${sanitizeFilename(file.name)}`;
        const { error: uploadError } = await supabase.storage
          .from("drink-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });
        if (uploadError) {
          toast.error(uploadError.message);
          return;
        }
        const { data } = supabase.storage.from("drink-images").getPublicUrl(filePath);
        const result = await addHomeDrinkImage(filePath, data.publicUrl);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
      }
      toast.success("Drink images uploaded.");
      setSelectedFiles([]);
      window.location.reload();
    });
  }

  function deleteDrink(id: string) {
    startTransition(async () => {
      const result = await removeHomeDrinkImage(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Drink image removed.");
      window.location.reload();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CupSoda className="h-5 w-5 text-neon-cyan" />
          Drinks Images
        </CardTitle>
        <CardDescription>
          Upload drink photos to show in the home highlights section.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {drinks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-muted-foreground">
            No drink images uploaded yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {drinks.map((drink) => (
              <div key={drink.id} className="space-y-2 rounded-xl border border-white/10 p-3">
                <img src={drink.image_url} alt="Drink" className="h-28 w-full rounded-lg object-cover" />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={isPending}
                  onClick={() => deleteDrink(drink.id)}
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
        </div>
        <Button onClick={uploadDrinks} disabled={isPending || selectedFiles.length === 0}>
          <Upload className="h-4 w-4" />
          Upload drinks
        </Button>
      </CardContent>
    </Card>
  );
}

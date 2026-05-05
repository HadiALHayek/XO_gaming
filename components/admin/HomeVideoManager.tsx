"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Upload, Trash2, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { clearHomeVideo, setHomeVideo } from "@/actions/media";

type Props = {
  currentUrl: string | null;
  currentPath: string | null;
};

function sanitizeFilename(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");
}

export function HomeVideoManager({ currentUrl, currentPath }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  async function uploadVideo() {
    if (!selectedFile) {
      toast.error("Please choose a video file first.");
      return;
    }
    const ext = selectedFile.type;
    if (!ext.startsWith("video/")) {
      toast.error("Only video files are allowed.");
      return;
    }

    const filePath = `hero/${Date.now()}-${sanitizeFilename(selectedFile.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("home-videos")
      .upload(filePath, selectedFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      toast.error(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("home-videos").getPublicUrl(filePath);
    startTransition(async () => {
      // Best effort cleanup of previous file when replacing.
      if (currentPath) {
        await supabase.storage.from("home-videos").remove([currentPath]).catch(() => {});
      }

      const result = await setHomeVideo(filePath, data.publicUrl);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Homepage video updated.");
      setSelectedFile(null);
      window.location.reload();
    });
  }

  async function deleteVideo() {
    startTransition(async () => {
      if (currentPath) {
        await supabase.storage.from("home-videos").remove([currentPath]).catch(() => {});
      }
      const result = await clearHomeVideo();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Homepage video removed.");
      window.location.reload();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="h-5 w-5 text-neon-cyan" />
          Homepage Video
        </CardTitle>
        <CardDescription>
          Upload a promo video to show on the user homepage. You can replace or delete it anytime.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentUrl ? (
          <video
            src={currentUrl}
            controls
            className="w-full rounded-xl border border-white/10 bg-black/40"
          />
        ) : (
          <div className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-muted-foreground">
            No homepage video set yet.
          </div>
        )}

        <div className="space-y-2">
          <Input
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-muted-foreground">
            Max recommended size: 50MB. Supported: MP4, WebM, OGG.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={uploadVideo} disabled={isPending || !selectedFile}>
            <Upload className="h-4 w-4" />
            {currentUrl ? "Replace video" : "Upload video"}
          </Button>
          <Button
            variant="outline"
            onClick={deleteVideo}
            disabled={isPending || !currentUrl}
          >
            <Trash2 className="h-4 w-4" />
            Delete video
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


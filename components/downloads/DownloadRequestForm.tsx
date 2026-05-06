"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  downloadRequestSchema,
  type DownloadRequestInput,
} from "@/lib/downloads/schemas";
import { createDownloadRequest } from "@/actions/downloads";
import { getUserActivity } from "@/actions/activity";
import { getOrCreateGuestToken } from "@/lib/guest/client";
import { formatDateTime } from "@/lib/dates";

export function DownloadRequestForm() {
  const [isPending, startTransition] = useTransition();
  const [previousRequests, setPreviousRequests] = useState<
    Array<{
      id: string;
      category: string;
      status: string;
      file_name: string;
      created_at: string;
    }>
  >([]);
  const form = useForm<DownloadRequestInput>({
    resolver: zodResolver(downloadRequestSchema),
    defaultValues: {
      category: "GAMES",
      fileName: "",
      customerName: "",
      customerPhone: "",
    },
  });

  useEffect(() => {
    const loadPrevious = async () => {
      getOrCreateGuestToken();
      const result = await getUserActivity();
      if (!result.ok) return;
      setPreviousRequests(result.data.downloadRequests.slice(0, 5));
    };
    void loadPrevious();
  }, []);

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const withGuestToken = {
        ...values,
        guestToken: getOrCreateGuestToken(),
      };
      const result = await createDownloadRequest(withGuestToken);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Request sent to admin.");
      const activity = await getUserActivity();
      if (activity.ok) {
        setPreviousRequests(activity.data.downloadRequests.slice(0, 5));
      }
      form.reset({
        category: "GAMES",
        fileName: "",
        customerName: "",
        customerPhone: "",
      });
    });
  });

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="d-category">Category</Label>
            <Select
              value={form.watch("category")}
              onValueChange={(v) =>
                form.setValue("category", v as DownloadRequestInput["category"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="d-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GAMES">Games</SelectItem>
                <SelectItem value="SERIES">Series</SelectItem>
                <SelectItem value="FILMS">Films</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="d-file">File name</Label>
            <Input id="d-file" placeholder="e.g. EA FC 25" {...form.register("fileName")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="d-name">Your name</Label>
              <Input id="d-name" placeholder="Your full name" {...form.register("customerName")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-phone">Phone number</Label>
              <Input
                id="d-phone"
                placeholder="09XXXXXXXX or +9639XXXXXXXX"
                {...form.register("customerPhone")}
              />
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Sending..." : "Send request"}
          </Button>
        </form>

        {previousRequests.length > 0 ? (
          <div className="space-y-2 border-t border-white/10 pt-4">
            <p className="text-sm font-medium">Previous requests</p>
            <div className="space-y-2">
              {previousRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground"
                >
                  <span className="font-medium text-foreground">{request.file_name}</span> -{" "}
                  {request.category} - {request.status} - {formatDateTime(request.created_at)}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

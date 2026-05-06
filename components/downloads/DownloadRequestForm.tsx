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
import { useI18n } from "@/components/providers/I18nProvider";

export function DownloadRequestForm() {
  const { t } = useI18n();
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
      const guestToken = getOrCreateGuestToken();
      const result = await getUserActivity({ guestToken });
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
      toast.success(t.downloads.requestSent);
      const activity = await getUserActivity({ guestToken: withGuestToken.guestToken });
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
            <Label htmlFor="d-category">{t.downloads.category}</Label>
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
                <SelectItem value="GAMES">{t.downloads.games}</SelectItem>
                <SelectItem value="SERIES">{t.downloads.series}</SelectItem>
                <SelectItem value="FILMS">{t.downloads.films}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="d-file">{t.downloads.fileName}</Label>
            <Input id="d-file" placeholder="e.g. EA FC 25" {...form.register("fileName")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="d-name">{t.downloads.yourName}</Label>
              <Input id="d-name" placeholder="Your full name" {...form.register("customerName")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-phone">{t.downloads.phoneNumber}</Label>
              <Input
                id="d-phone"
                placeholder="09XXXXXXXX or +9639XXXXXXXX"
                {...form.register("customerPhone")}
              />
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? t.downloads.sending : t.downloads.sendRequest}
          </Button>
        </form>

        {previousRequests.length > 0 ? (
          <div className="space-y-2 border-t border-white/10 pt-4">
            <p className="text-sm font-medium">{t.downloads.previousRequests}</p>
            <div className="space-y-2">
              {previousRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground"
                >
                  <span className="font-medium text-foreground">{request.file_name}</span> -{" "}
                  {request.category} -{" "}
                  {request.status === "HOLD"
                    ? t.common.hold
                    : request.status === "ON_PROGRESS"
                      ? t.common.onProgress
                      : t.common.finished}{" "}
                  - {formatDateTime(request.created_at)}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

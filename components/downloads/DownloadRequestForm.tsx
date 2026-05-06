"use client";

import { useTransition } from "react";
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

export function DownloadRequestForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<DownloadRequestInput>({
    resolver: zodResolver(downloadRequestSchema),
    defaultValues: {
      category: "GAMES",
      fileName: "",
      customerName: "",
      customerPhone: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await createDownloadRequest(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Request sent to admin.");
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
      </CardContent>
    </Card>
  );
}

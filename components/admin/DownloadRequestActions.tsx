"use client";

import { useState, useTransition } from "react";
import { MessageCircle, Pencil, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  deleteDownloadRequestByAdmin,
  updateDownloadRequestByAdmin,
} from "@/actions/downloads";
import type { DownloadRequest, DownloadRequestCategory, DownloadRequestStatus } from "@/types";

function buildReadyMessage(request: DownloadRequest) {
  return `مرحبا ${request.customer_name}، طلب التحميل "${request.file_name}" أصبح جاهزاً للتسليم.`;
}

function normalizePhoneForLinks(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function toWhatsappLink(phone: string, message: string) {
  const digits = normalizePhoneForLinks(phone).replace(/^\+/, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function toSmsLink(phone: string, message: string) {
  const digits = normalizePhoneForLinks(phone);
  return `sms:${digits}?&body=${encodeURIComponent(message)}`;
}

export function DownloadRequestActions({ request }: { request: DownloadRequest }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<DownloadRequestCategory>(request.category);
  const [status, setStatus] = useState<DownloadRequestStatus>(request.status);
  const [fileName, setFileName] = useState(request.file_name);
  const [customerName, setCustomerName] = useState(request.customer_name);
  const [customerPhone, setCustomerPhone] = useState(request.customer_phone);
  const [isPending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      const result = await updateDownloadRequestByAdmin({
        id: request.id,
        category,
        status,
        fileName,
        customerName,
        customerPhone,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Download request updated.");
      setOpen(false);
    });
  };

  const remove = () => {
    const ok = window.confirm("Delete this download request?");
    if (!ok) return;
    startTransition(async () => {
      const result = await deleteDownloadRequestByAdmin(request.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Download request deleted.");
      setOpen(false);
    });
  };

  const readyMessage = buildReadyMessage(request);
  const whatsappLink = toWhatsappLink(request.customer_phone, readyMessage);
  const smsLink = toSmsLink(request.customer_phone, readyMessage);

  return (
    <div className="flex items-center justify-end gap-1">
      <Button asChild size="icon" variant="ghost" title="Send via WhatsApp">
        <a href={whatsappLink} target="_blank" rel="noreferrer">
          <MessageCircle className="h-4 w-4 text-emerald-400" />
        </a>
      </Button>
      <Button asChild size="icon" variant="ghost" title="Send via SMS">
        <a href={smsLink}>
          <Send className="h-4 w-4 text-cyan-400" />
        </a>
      </Button>
      <Button size="icon" variant="ghost" title="Edit request" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost" title="Delete request" onClick={remove}>
        <Trash2 className="h-4 w-4 text-red-400" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit download request</DialogTitle>
            <DialogDescription>Update status and request details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as DownloadRequestCategory)}>
                <SelectTrigger>
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
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as DownloadRequestStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOLD">Hold</SelectItem>
                  <SelectItem value="ON_PROGRESS">On progress</SelectItem>
                  <SelectItem value="FINISHED">Finished</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>File name</Label>
              <Input value={fileName} onChange={(e) => setFileName(e.target.value)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Customer name</Label>
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone number</Label>
                <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={save} disabled={isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

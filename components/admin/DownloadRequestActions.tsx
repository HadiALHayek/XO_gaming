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
import { useI18n } from "@/components/providers/I18nProvider";

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
  const { t } = useI18n();
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
      toast.success(t.adminDownloads.updated);
      setOpen(false);
    });
  };

  const remove = () => {
    const ok = window.confirm(t.adminDownloads.deleteConfirm);
    if (!ok) return;
    startTransition(async () => {
      const result = await deleteDownloadRequestByAdmin(request.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t.adminDownloads.deleted);
      setOpen(false);
    });
  };

  const readyMessage = buildReadyMessage(request);
  const whatsappLink = toWhatsappLink(request.customer_phone, readyMessage);
  const smsLink = toSmsLink(request.customer_phone, readyMessage);

  return (
    <div className="flex items-center justify-end gap-1">
      <Button asChild size="icon" variant="ghost" title={t.adminDownloads.sendWhatsapp}>
        <a href={whatsappLink} target="_blank" rel="noreferrer">
          <MessageCircle className="h-4 w-4 text-emerald-400" />
        </a>
      </Button>
      <Button asChild size="icon" variant="ghost" title={t.adminDownloads.sendSms}>
        <a href={smsLink}>
          <Send className="h-4 w-4 text-cyan-400" />
        </a>
      </Button>
      <Button size="icon" variant="ghost" title={t.adminDownloads.editRequest} onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost" title={t.adminDownloads.deleteRequest} onClick={remove}>
        <Trash2 className="h-4 w-4 text-red-400" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.adminDownloads.editRequest}</DialogTitle>
            <DialogDescription>{t.adminDownloads.updateDetails}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>{t.adminDownloads.category}</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as DownloadRequestCategory)}>
                <SelectTrigger>
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
              <Label>{t.adminDownloads.status}</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as DownloadRequestStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOLD">{t.common.hold}</SelectItem>
                  <SelectItem value="ON_PROGRESS">{t.common.onProgress}</SelectItem>
                  <SelectItem value="FINISHED">{t.common.finished}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t.downloads.fileName}</Label>
              <Input value={fileName} onChange={(e) => setFileName(e.target.value)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t.adminDownloads.customerName}</Label>
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>{t.downloads.phoneNumber}</Label>
                <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t.adminDownloads.cancel}
            </Button>
            <Button type="button" onClick={save} disabled={isPending}>
                {isPending ? t.adminDownloads.saving : t.adminDownloads.saveChanges}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

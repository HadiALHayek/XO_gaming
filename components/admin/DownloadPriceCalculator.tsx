"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/components/providers/I18nProvider";

export function DownloadPriceCalculator() {
  const { t } = useI18n();
  const [sizeGb, setSizeGb] = useState<string>("0");

  const price = useMemo(() => {
    const value = Number(sizeGb);
    if (Number.isNaN(value) || value < 0) return 0;
    return value * 2;
  }, [sizeGb]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.calculator.title}</CardTitle>
        <CardDescription>{t.calculator.rule}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="download-size-gb">{t.calculator.downloadedSize}</Label>
          <Input
            id="download-size-gb"
            type="number"
            min={0}
            step="0.01"
            value={sizeGb}
            onChange={(e) => setSizeGb(e.target.value)}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {t.calculator.totalPrice}:{" "}
          <span className="font-semibold text-foreground">{price.toFixed(2)} SYP</span>
        </p>
      </CardContent>
    </Card>
  );
}

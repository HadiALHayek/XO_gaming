"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DownloadPriceCalculator() {
  const [sizeGb, setSizeGb] = useState<string>("0");

  const price = useMemo(() => {
    const value = Number(sizeGb);
    if (Number.isNaN(value) || value < 0) return 0;
    return value * 2;
  }, [sizeGb]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download Price Calculator</CardTitle>
        <CardDescription>
          Price rule: 2 Syrian Pound for each 1 GB downloaded.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="download-size-gb">Downloaded size (GB)</Label>
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
          Total price: <span className="font-semibold text-foreground">{price.toFixed(2)} SYP</span>
        </p>
      </CardContent>
    </Card>
  );
}

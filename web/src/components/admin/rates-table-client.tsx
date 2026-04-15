"use client";

import * as React from "react";
import type { Rate } from "@/types/api";
import type { Locale } from "@/i18n/config";
import { listRates } from "@/lib/api";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type Dict = {
  col_material: string;
  col_unit: string;
  col_price: string;
  col_region: string;
  col_source: string;
  col_observed: string;
  loading: string;
};

export function RatesTableClient({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dict;
}) {
  const [rates, setRates] = React.useState<Rate[] | null>(null);

  React.useEffect(() => {
    listRates().then(setRates);
  }, []);

  if (!rates) return <div className="text-sm text-slate-500">{dict.loading}</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{dict.col_material}</TableHead>
          <TableHead>{dict.col_unit}</TableHead>
          <TableHead className="text-right">{dict.col_price}</TableHead>
          <TableHead>{dict.col_region}</TableHead>
          <TableHead>{dict.col_source}</TableHead>
          <TableHead>{dict.col_observed}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rates.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="font-medium">{r.material}</TableCell>
            <TableCell className="text-sm text-[var(--muted-foreground)]">
              {r.unit}
            </TableCell>
            <TableCell className="text-right font-semibold text-[var(--accent)] font-variant-numeric">
              {r.price.toLocaleString(locale)}
            </TableCell>
            <TableCell className="text-sm">{r.region ?? "—"}</TableCell>
            <TableCell>
              <Badge
                variant={
                  r.source === "approved_smeta"
                    ? "success"
                    : r.source === "supplier_quote"
                      ? "warning"
                      : "outline"
                }
              >
                {r.source}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-[var(--muted-foreground)]">
              {formatDate(r.observed_at, locale)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

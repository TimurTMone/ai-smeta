"use client";

import * as React from "react";
import type { Locale } from "@/i18n/config";
import type { Project, Smeta } from "@/types/api";
import { getSmeta, exportSmetaXlsx } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Download, Mic, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Dict = {
  add_line: string;
  import_voice: string;
  total: string;
  export_xlsx: string;
  export_pdf: string;
  loading: string;
};

export function SmetaEditorClient({
  projectId,
  locale,
  dict,
}: {
  projectId: string;
  locale: Locale;
  dict: Dict;
}) {
  const [loading, setLoading] = React.useState(true);
  const [project, setProject] = React.useState<Project | null>(null);
  const [smeta, setSmeta] = React.useState<Smeta | null>(null);

  React.useEffect(() => {
    let alive = true;
    getSmeta(projectId)
      .then(({ project: p, data }) => {
        if (!alive) return;
        setProject(p);
        setSmeta(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      alive = false;
    };
  }, [projectId]);

  async function handleExport() {
    const { download_url } = await exportSmetaXlsx(projectId);
    window.open(download_url, "_blank");
  }

  if (loading || !smeta || !project) {
    return (
      <div className="text-sm text-[var(--muted-foreground)]">{dict.loading}</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {project.name}
          </h1>
          <div className="mt-1 text-sm text-[var(--muted-foreground)]">
            <Badge variant="outline">{project.status}</Badge>
            <span className="ml-2 text-xs">
              {smeta.region} · {smeta.currency}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" disabled title="Coming soon">
            <Mic className="w-4 h-4" />
            {dict.import_voice}
          </Button>
          <Button variant="secondary" disabled title="Coming soon">
            <Plus className="w-4 h-4" />
            {dict.add_line}
          </Button>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4" />
            {dict.export_xlsx}
          </Button>
        </div>
      </div>

      {smeta.sections.map((section, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <h2 className="text-base font-bold mb-4">{section.name.ru}</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Наименование</TableHead>
                  <TableHead>Ед.</TableHead>
                  <TableHead className="text-right">Кол-во</TableHead>
                  <TableHead className="text-right">Цена</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                  <TableHead>Источник</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.description.ru}
                    </TableCell>
                    <TableCell className="text-[var(--muted-foreground)]">
                      {item.unit}
                    </TableCell>
                    <TableCell className="text-right font-variant-numeric">
                      {item.qty}
                    </TableCell>
                    <TableCell className="text-right font-variant-numeric">
                      {item.rate.toLocaleString(locale)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-[var(--accent)]">
                      {formatCurrency(item.total, smeta.currency, locale)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.source === "history"
                            ? "success"
                            : item.source === "market"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {item.source}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm uppercase tracking-wider font-semibold text-[var(--muted-foreground)]">
              {dict.total}
            </div>
            <div className="text-3xl font-extrabold text-[var(--accent)] font-variant-numeric">
              {formatCurrency(smeta.total, smeta.currency, locale)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

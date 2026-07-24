"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconAlertCircle,
  IconDownload,
  IconFileTypeCsv,
  IconFileTypeXls,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import Papa from "papaparse";
import { useCallback, useRef } from "react";
import { useDownloadTemplate } from "../hooks";
import type { ImportResult } from "../types";
import { normalizeHeader } from "../utils/normalize";

type PreviewRow = Record<string, string>;

const REQUIRED_COLUMNS = ["date", "amount", "description", "category"];
const OPTIONAL_COLUMNS = ["account", "type", "method", "notes"];
const ALL_EXPECTED = new Set([...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS]);

type CsvImportTabProps = {
  onPreviewReady: (
    file: File,
    previewRows: PreviewRow[],
    detectedColumns: string[],
  ) => void;
};

export const CsvImportTab = ({ onPreviewReady }: CsvImportTabProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { downloadTemplate } = useDownloadTemplate();

  const parseForPreview = useCallback(async (f: File) => {
    if (f.name.endsWith(".xlsx")) {
      const formData = new FormData();
      formData.append("file", f);
      const res = await fetch("/api/import-export/preview", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) return null;
      const json = await res.json();
      return {
        rows: json.data.rows as PreviewRow[],
        columns: json.data.columns as string[],
      };
    }

    const text = await f.text();
    const parsed = Papa.parse<PreviewRow>(text, {
      header: true,
      skipEmptyLines: true,
      preview: 6,
      transformHeader: normalizeHeader,
    });
    return {
      rows: parsed.data,
      columns: parsed.meta.fields ?? [],
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const preview = await parseForPreview(selectedFile);
    if (preview) {
      onPreviewReady(selectedFile, preview.rows, preview.columns);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-muted/50">
        <div className="flex items-start gap-3">
          <IconAlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Download the Excel template — it has dropdowns pre-filled with
              your categories and accounts. Required columns:{" "}
              <strong>date, amount, description, category</strong>.
            </p>
            <p className="text-xs">
              Accepts <code>.xlsx</code> and <code>.csv</code> files. Flexible
              column names and date formats are handled automatically.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="mt-2"
            >
              <IconDownload className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx"
        onChange={handleFileChange}
        className="hidden"
        id="csv-file-input"
      />
      <label htmlFor="csv-file-input" className="block">
        <div className="flex flex-col items-center justify-center gap-2 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          <IconUpload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Click to select a CSV or Excel (.xlsx) file
          </p>
        </div>
      </label>
    </div>
  );
};

type CsvPreviewStepProps = {
  file: File;
  previewRows: PreviewRow[];
  detectedColumns: string[];
  onImport: () => void;
  onBack: () => void;
  isImporting: boolean;
};

export const CsvPreviewStep = ({
  file,
  previewRows,
  detectedColumns,
  onImport,
  onBack,
  isImporting,
}: CsvPreviewStepProps) => {
  const missingRequired = REQUIRED_COLUMNS.filter(
    (col) => !detectedColumns.includes(col),
  );
  const unknownColumns = detectedColumns.filter(
    (col) => !ALL_EXPECTED.has(col),
  );

  return (
    <div className="space-y-4 min-w-0">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
        {file.name.endsWith(".xlsx") ? (
          <IconFileTypeXls className="h-6 w-6 text-primary shrink-0" />
        ) : (
          <IconFileTypeCsv className="h-6 w-6 text-primary shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Detected columns
        </p>
        <div className="flex flex-wrap gap-1.5">
          {detectedColumns.map((col) => (
            <Badge
              key={col}
              variant={ALL_EXPECTED.has(col) ? "default" : "secondary"}
              className="text-xs"
            >
              {col}
            </Badge>
          ))}
          {unknownColumns.length > 0 && (
            <span className="text-xs text-muted-foreground self-center">
              (unrecognized columns will be ignored)
            </span>
          )}
        </div>

        {missingRequired.length > 0 && (
          <div className="flex items-start gap-2 p-2 rounded bg-destructive/10 text-destructive text-xs">
            <IconX className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>
              Missing required columns:{" "}
              <strong>{missingRequired.join(", ")}</strong>
            </span>
          </div>
        )}
      </div>

      {previewRows.length > 0 && (
        <div className="overflow-hidden rounded-lg border">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-muted/50">
                {detectedColumns
                  .filter((c) => ALL_EXPECTED.has(c))
                  .map((col) => (
                    <TableHead
                      key={col}
                      className="h-auto px-3 py-2 text-muted-foreground"
                    >
                      {col}
                    </TableHead>
                  ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewRows.map((row, idx) => (
                <TableRow key={idx}>
                  {detectedColumns
                    .filter((c) => ALL_EXPECTED.has(c))
                    .map((col) => (
                      <TableCell
                        key={col}
                        className="px-3 py-2 max-w-40 truncate"
                        title={row[col]}
                      >
                        {row[col] ?? "—"}
                      </TableCell>
                    ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {previewRows.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No rows detected in the file.
        </p>
      )}

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onImport}
          disabled={
            isImporting ||
            missingRequired.length > 0 ||
            previewRows.length === 0
          }
        >
          {isImporting ? "Importing..." : "Import"}
        </Button>
      </div>
    </div>
  );
};

type CsvResultStepProps = {
  result: ImportResult;
  onClose: () => void;
};

export const CsvResultStep = ({ result, onClose }: CsvResultStepProps) => {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Imported</p>
              <p className="text-2xl font-bold text-green-600">
                {result.success}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-red-600">{result.failed}</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <p className="text-sm font-medium">Row errors:</p>
              {result.errors.map((error, index) => (
                <div
                  key={index}
                  className="text-xs p-2 bg-destructive/10 rounded border border-destructive/20"
                >
                  <span className="font-medium">Row {error.row}:</span>{" "}
                  {error.error}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

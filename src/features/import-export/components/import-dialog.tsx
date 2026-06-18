"use client";

import { useState, useRef, useCallback } from "react";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconUpload,
  IconFileTypeCsv,
  IconFileTypeXls,
  IconAlertCircle,
  IconDownload,
  IconCheck,
  IconX,
  IconArrowLeft,
} from "@tabler/icons-react";
import { useImportExpenses, useDownloadTemplate } from "../hooks";
import { normalizeHeader } from "../utils/normalize";
import type { ImportResult } from "../types";

type Step = "upload" | "preview" | "result";

type PreviewRow = Record<string, string>;

const REQUIRED_COLUMNS = ["date", "amount", "description", "category"];
const OPTIONAL_COLUMNS = ["account", "type", "method", "notes"];
const ALL_EXPECTED = new Set([...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS]);

type ImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ImportDialog = ({ open, onOpenChange }: ImportDialogProps) => {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { importExpenses, isImporting } = useImportExpenses();
  const { downloadTemplate } = useDownloadTemplate();

  const parseForPreview = useCallback(async (f: File) => {
    if (f.name.endsWith(".xlsx")) {
      // Excel: send to server for parsing (ExcelJS is server-only)
      const formData = new FormData();
      formData.append("file", f);
      const res = await fetch("/api/import-export/preview", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) return;
      const json = await res.json();
      setPreviewRows(json.data.rows);
      setDetectedColumns(json.data.columns);
    } else {
      // CSV: parse client-side instantly
      const text = await f.text();
      const parsed = Papa.parse<PreviewRow>(text, {
        header: true,
        skipEmptyLines: true,
        preview: 6,
        transformHeader: normalizeHeader,
      });
      setPreviewRows(parsed.data);
      setDetectedColumns(parsed.meta.fields ?? []);
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setResult(null);
    setStep("preview");
    await parseForPreview(selectedFile);
  };

  const handleImport = async () => {
    if (!file) return;
    try {
      const importResult = await importExpenses(file);
      setResult(importResult);
      setStep("result");
    } catch {
      // error handled in hook
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setPreviewRows([]);
    setDetectedColumns([]);
    setStep("upload");
    onOpenChange(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleBack = () => {
    setStep("upload");
    setFile(null);
    setPreviewRows([]);
    setDetectedColumns([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const missingRequired = REQUIRED_COLUMNS.filter(
    (col) => !detectedColumns.includes(col),
  );
  const unknownColumns = detectedColumns.filter(
    (col) => !ALL_EXPECTED.has(col),
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Import Expenses</DialogTitle>
          <DialogDescription>
            {step === "upload" && "Upload a CSV file to import expenses"}
            {step === "preview" &&
              `Preview — ${previewRows.length} rows shown (up to 5)`}
            {step === "result" && "Import complete"}
          </DialogDescription>
        </DialogHeader>

        {/* ─── UPLOAD STEP ─── */}
        {step === "upload" && (
          <div className="space-y-4">
            <Card className="p-4 bg-muted/50">
              <div className="flex items-start gap-3">
                <IconAlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Download the Excel template — it has dropdowns pre-filled
                    with your categories and accounts. Required columns:{" "}
                    <strong>date, amount, description, category</strong>.
                  </p>
                  <p className="text-xs">
                    Accepts <code>.xlsx</code> and <code>.csv</code> files.
                    Flexible column names and date formats (DD/MM/YYYY,
                    YYYY-MM-DD, etc.) are handled automatically.
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
        )}

        {/* ─── PREVIEW STEP ─── */}
        {step === "preview" && (
          <div className="space-y-4 min-w-0">
            {/* File info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              {file?.name.endsWith(".xlsx") ? (
                <IconFileTypeXls className="h-6 w-6 text-primary shrink-0" />
              ) : (
                <IconFileTypeCsv className="h-6 w-6 text-primary shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{file?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {((file?.size ?? 0) / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            {/* Column detection */}
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

            {/* Preview table */}
            {previewRows.length > 0 && (
              <div className="overflow-x-auto rounded-lg border">
                <table className="text-xs w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      {detectedColumns
                        .filter((c) => ALL_EXPECTED.has(c))
                        .map((col) => (
                          <th
                            key={col}
                            className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap"
                          >
                            {col}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, idx) => (
                      <tr key={idx} className="border-t">
                        {detectedColumns
                          .filter((c) => ALL_EXPECTED.has(c))
                          .map((col) => (
                            <td
                              key={col}
                              className="px-3 py-2 max-w-[160px] truncate"
                              title={row[col]}
                            >
                              {row[col] ?? "—"}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {previewRows.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No rows detected in the file.
              </p>
            )}
          </div>
        )}

        {/* ─── RESULT STEP ─── */}
        {step === "result" && result && (
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
                  <p className="text-2xl font-bold text-red-600">
                    {result.failed}
                  </p>
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

              {result.failed === 0 && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <IconCheck className="h-4 w-4" />
                  All rows imported successfully
                </div>
              )}
            </div>
          </Card>
        )}

        <DialogFooter className="gap-2">
          {step === "upload" && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}

          {step === "preview" && (
            <>
              <Button variant="outline" onClick={handleBack}>
                <IconArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={
                  isImporting ||
                  missingRequired.length > 0 ||
                  previewRows.length === 0
                }
              >
                {isImporting ? "Importing..." : "Import"}
              </Button>
            </>
          )}

          {step === "result" && <Button onClick={handleClose}>Close</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

"use client";

import { useState, useRef } from "react";
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
import {
  IconUpload,
  IconFileTypeCsv,
  IconAlertCircle,
  IconDownload,
} from "@tabler/icons-react";
import { useImportExpenses, useDownloadTemplate } from "../hooks";
import type { ImportResult } from "../types";

type ImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ImportDialog = ({ open, onOpenChange }: ImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importExpenses = useImportExpenses();
  const { downloadTemplate } = useDownloadTemplate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      const importResult = await importExpenses.mutateAsync(file);
      setResult(importResult);

      if (importResult.failed === 0) {
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onOpenChange(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Expenses</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import expenses into your account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="p-4 bg-muted/50">
            <div className="flex items-start gap-3">
              <IconAlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Download the CSV template to see the required format. Make
                  sure categories and accounts exist in your account before
                  importing.
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

          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input">
              <Button
                variant="outline"
                className="w-full h-32 cursor-pointer"
                asChild
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  {file ? (
                    <>
                      <IconFileTypeCsv className="h-8 w-8 text-primary" />
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <IconUpload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to select CSV file
                      </p>
                    </>
                  )}
                </div>
              </Button>
            </label>
          </div>

          {result && (
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Import Results</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Success</p>
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
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    <p className="text-sm font-medium">Errors:</p>
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
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={importExpenses.isPending}
          >
            {result ? "Close" : "Cancel"}
          </Button>
          {!result && (
            <Button
              onClick={handleImport}
              disabled={!file || importExpenses.isPending}
            >
              {importExpenses.isPending ? "Importing..." : "Import"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

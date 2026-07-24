"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { useImportExpenses, useSmartImport } from "../hooks";
import type {
  ImportResult,
  SmartImportConfirmResult,
  SmartImportRow,
} from "../types";
import { CsvImportTab, CsvPreviewStep, CsvResultStep } from "./csv-import-tab";
import { ImageImportTab } from "./image-import-tab";
import { PasteImportTab } from "./paste-import-tab";
import { SmartResultStep, SmartReviewStep } from "./smart-review-step";

type ImportMethod = "paste" | "screenshot" | "csv";
type Step = "input" | "csv-preview" | "smart-review" | "result";

type ImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ImportDialogBodyProps = {
  onClose: () => void;
  variant: "dialog" | "drawer";
};

const ImportDialogBody = ({ onClose, variant }: ImportDialogBodyProps) => {
  const [method, setMethod] = useState<ImportMethod>("paste");
  const [step, setStep] = useState<Step>("input");
  const [smartRows, setSmartRows] = useState<SmartImportRow[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [smartResult, setSmartResult] =
    useState<SmartImportConfirmResult | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreviewRows, setCsvPreviewRows] = useState<
    Record<string, string>[]
  >([]);
  const [csvDetectedColumns, setCsvDetectedColumns] = useState<string[]>([]);
  const [csvResult, setCsvResult] = useState<ImportResult | null>(null);

  const {
    analyzeText,
    analyzeImages,
    confirmImport,
    isAnalyzing,
    isConfirming,
  } = useSmartImport();
  const { importExpenses, isImporting } = useImportExpenses();

  const handleAnalyzeText = async (text: string) => {
    const result = await analyzeText(text);
    setSessionId(result.sessionId);
    setSmartRows(result.rows);
    setStep("smart-review");
  };

  const handleAnalyzeImages = async (images: File[]) => {
    const result = await analyzeImages(images);
    setSessionId(result.sessionId);
    setSmartRows(result.rows);
    setStep("smart-review");
  };

  const handleConfirmSmartImport = async () => {
    const result = await confirmImport(sessionId, smartRows);
    setSmartResult(result);
    setStep("result");
  };

  const handleCsvPreviewReady = (
    file: File,
    previewRows: Record<string, string>[],
    detectedColumns: string[],
  ) => {
    setCsvFile(file);
    setCsvPreviewRows(previewRows);
    setCsvDetectedColumns(detectedColumns);
    setStep("csv-preview");
  };

  const handleCsvImport = async () => {
    if (!csvFile) return;
    const result = await importExpenses(csvFile);
    setCsvResult(result);
    setStep("result");
  };

  const handleBack = () => {
    setStep("input");
    setSmartRows([]);
    setSessionId("");
    setCsvFile(null);
    setCsvPreviewRows([]);
    setCsvDetectedColumns([]);
  };

  const handleClose = () => {
    onClose();
  };

  const description =
    step === "smart-review"
      ? "Review and edit extracted transactions before importing"
      : step === "csv-preview"
        ? `Preview — ${csvPreviewRows.length} rows shown (up to 5)`
        : step === "result"
          ? "Import complete"
          : "Paste messages, upload screenshots, or import a CSV file";

  const content = (
    <div className="space-y-4">
      {step === "input" && (
        <Tabs
          value={method}
          onValueChange={(v) => setMethod(v as ImportMethod)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="paste">Paste Text</TabsTrigger>
            <TabsTrigger value="screenshot">Screenshot</TabsTrigger>
            <TabsTrigger value="csv">CSV / Excel</TabsTrigger>
          </TabsList>
          <TabsContent value="paste" className="mt-4">
            <PasteImportTab
              onAnalyze={handleAnalyzeText}
              isAnalyzing={isAnalyzing}
            />
          </TabsContent>
          <TabsContent value="screenshot" className="mt-4">
            <ImageImportTab
              onAnalyze={handleAnalyzeImages}
              isAnalyzing={isAnalyzing}
            />
          </TabsContent>
          <TabsContent value="csv" className="mt-4">
            <CsvImportTab onPreviewReady={handleCsvPreviewReady} />
          </TabsContent>
        </Tabs>
      )}

      {step === "smart-review" && (
        <SmartReviewStep
          rows={smartRows}
          onRowsChange={setSmartRows}
          onConfirm={handleConfirmSmartImport}
          onBack={handleBack}
          isConfirming={isConfirming}
        />
      )}

      {step === "csv-preview" && csvFile && (
        <CsvPreviewStep
          file={csvFile}
          previewRows={csvPreviewRows}
          detectedColumns={csvDetectedColumns}
          onImport={handleCsvImport}
          onBack={handleBack}
          isImporting={isImporting}
        />
      )}

      {step === "result" && smartResult && (
        <SmartResultStep result={smartResult} onClose={handleClose} />
      )}

      {step === "result" && csvResult && !smartResult && (
        <CsvResultStep result={csvResult} onClose={handleClose} />
      )}
    </div>
  );

  if (variant === "drawer") {
    return (
      <>
        <DrawerHeader className="shrink-0 text-left">
          <DrawerTitle>Import Expenses</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
          {content}
        </div>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Import Expenses</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      {content}
    </>
  );
};

export const ImportDialog = ({ open, onOpenChange }: ImportDialogProps) => {
  const isMobile = useIsMobile();

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent className="flex max-h-[95dvh] min-h-0 flex-col overflow-hidden">
          {open && (
            <ImportDialogBody
              onClose={() => handleOpenChange(false)}
              variant="drawer"
            />
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-180 max-h-[90vh] overflow-y-auto overflow-x-hidden">
        {open && (
          <ImportDialogBody
            onClose={() => handleOpenChange(false)}
            variant="dialog"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

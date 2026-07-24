"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { IconAlertTriangle, IconCheck, IconX } from "@tabler/icons-react";
import { useMemo, type ReactNode } from "react";
import type { SmartImportConfirmResult, SmartImportRow } from "../types";

type SmartReviewStepProps = {
  rows: SmartImportRow[];
  onRowsChange: (rows: SmartImportRow[]) => void;
  onConfirm: () => void;
  onBack: () => void;
  isConfirming: boolean;
};

const confidenceBadgeVariant = (confidence: number) => {
  if (confidence >= 0.8) return "default";
  if (confidence >= 0.5) return "secondary";
  return "outline";
};

const formatConfidence = (confidence: number) =>
  `${Math.round(confidence * 100)}%`;

type RowEditorProps = {
  row: SmartImportRow;
  categories: Array<{ id: string; name: string }>;
  onChange: (updated: SmartImportRow) => void;
  isMobile: boolean;
};

const MobileField = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="min-w-0 space-y-1">
    <span className="block text-[11px] font-medium text-muted-foreground">
      {label}
    </span>
    {children}
  </div>
);

const RowEditor = ({ row, categories, onChange, isMobile }: RowEditorProps) => {
  const handleFieldChange = <K extends keyof SmartImportRow>(
    field: K,
    value: SmartImportRow[K],
  ) => {
    onChange({ ...row, [field]: value });
  };

  if (isMobile) {
    return (
      <Card
        className={cn(
          "gap-0 p-3.5",
          !row.included && "opacity-60",
          row.possibleDuplicate && "border-amber-500/40",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <Checkbox
              id={`include-${row.id}`}
              checked={row.included}
              onCheckedChange={(checked) =>
                handleFieldChange("included", checked === true)
              }
              aria-label={`Include ${row.description}`}
            />
            <Label
              htmlFor={`include-${row.id}`}
              className="text-sm font-semibold"
            >
              Include
            </Label>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge
              variant={confidenceBadgeVariant(row.confidence)}
              className="text-[11px]"
            >
              {formatConfidence(row.confidence)}
            </Badge>
            {row.possibleDuplicate && (
              <Badge
                variant="outline"
                className="text-[11px] text-amber-600 border-amber-500/40"
              >
                <IconAlertTriangle className="mr-0.5 h-3 w-3" />
                Duplicate?
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-2.5">
          <MobileField label="Description">
            <Input
              value={row.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              aria-label="Description"
            />
          </MobileField>

          <div className="grid grid-cols-2 gap-2.5">
            <MobileField label="Amount">
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={row.amount}
                onChange={(e) =>
                  handleFieldChange("amount", parseFloat(e.target.value) || 0)
                }
                aria-label="Amount"
              />
            </MobileField>
            <MobileField label="Date">
              <DatePicker
                date={new Date(row.date)}
                onSelect={(date) => {
                  if (date) handleFieldChange("date", date.toISOString());
                }}
                formatStr="dd/MM/yyyy"
                className="w-full"
              />
            </MobileField>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <MobileField label="Category">
              <Select
                value={row.category}
                onValueChange={(v) => handleFieldChange("category", v)}
              >
                <SelectTrigger className="w-full" aria-label="Category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </MobileField>
            <MobileField label="Paid via">
              <Select
                value={row.paymentMethod ?? "OTHER"}
                onValueChange={(v) =>
                  handleFieldChange(
                    "paymentMethod",
                    v as SmartImportRow["paymentMethod"],
                  )
                }
              >
                <SelectTrigger className="w-full" aria-label="Payment method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </MobileField>
          </div>

          <div
            role="radiogroup"
            aria-label="Transaction type"
            className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1"
          >
            <button
              type="button"
              role="radio"
              aria-checked={row.type === "EXPENSE"}
              onClick={() => handleFieldChange("type", "EXPENSE")}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                row.type === "EXPENSE"
                  ? "bg-background text-red-600 shadow-sm dark:text-red-400"
                  : "text-muted-foreground",
              )}
            >
              Expense
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={row.type === "INCOME"}
              onClick={() => handleFieldChange("type", "INCOME")}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                row.type === "INCOME"
                  ? "bg-background text-emerald-600 shadow-sm dark:text-emerald-400"
                  : "text-muted-foreground",
              )}
            >
              Income
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <TableRow
      className={cn(
        !row.included && "opacity-60 bg-muted/30",
        row.possibleDuplicate && "bg-amber-500/5",
      )}
    >
      <TableCell className="px-2 py-2">
        <Checkbox
          checked={row.included}
          onCheckedChange={(checked) =>
            handleFieldChange("included", checked === true)
          }
          aria-label={`Include ${row.description}`}
        />
      </TableCell>
      <TableCell className="px-2 py-2">
        <DatePicker
          date={new Date(row.date)}
          onSelect={(date) => {
            if (date) handleFieldChange("date", date.toISOString());
          }}
          formatStr="dd/MM/yyyy"
          className="h-8 w-28 px-2 text-xs"
        />
      </TableCell>
      <TableCell className="px-2 py-2 min-w-30">
        <Input
          value={row.description}
          onChange={(e) => handleFieldChange("description", e.target.value)}
          className="h-8 text-xs"
          aria-label="Description"
        />
      </TableCell>
      <TableCell className="px-2 py-2">
        <Input
          type="number"
          step="0.01"
          min="0"
          value={row.amount}
          onChange={(e) =>
            handleFieldChange("amount", parseFloat(e.target.value) || 0)
          }
          className="h-8 text-xs w-20"
          aria-label="Amount"
        />
      </TableCell>
      <TableCell className="px-2 py-2">
        <Select
          value={row.category}
          onValueChange={(v) => handleFieldChange("category", v)}
        >
          <SelectTrigger className="h-8 text-xs w-27" aria-label="Category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="px-2 py-2">
        <Select
          value={row.type}
          onValueChange={(v) =>
            handleFieldChange("type", v as SmartImportRow["type"])
          }
        >
          <SelectTrigger className="h-8 text-xs w-22" aria-label="Type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="px-2 py-2">
        <div className="flex flex-col items-start gap-1">
          <Badge
            variant={confidenceBadgeVariant(row.confidence)}
            className="text-xs whitespace-nowrap"
          >
            {formatConfidence(row.confidence)}
          </Badge>
          {row.possibleDuplicate && (
            <Badge
              variant="outline"
              className="text-xs text-amber-600 border-amber-500/40 whitespace-nowrap"
            >
              Dup?
            </Badge>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export const SmartReviewStep = ({
  rows,
  onRowsChange,
  onConfirm,
  onBack,
  isConfirming,
}: SmartReviewStepProps) => {
  const isMobile = useIsMobile();
  const { categories } = useCategories();

  // Default and user categories can share names (e.g. two "Friends") — the
  // select matches rows by name, so duplicates would both render as selected.
  const categoryList = useMemo(() => {
    const seen = new Set<string>();
    return (categories ?? []).filter((cat) => {
      const key = cat.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [categories]);

  const includedCount = rows.filter((r) => r.included).length;
  const duplicateCount = rows.filter((r) => r.possibleDuplicate).length;

  const handleRowChange = (index: number, updated: SmartImportRow) => {
    const next = [...rows];
    next[index] = updated;
    onRowsChange(next);
  };

  const handleToggleAll = (included: boolean) => {
    onRowsChange(rows.map((r) => ({ ...r, included })));
  };

  return (
    <div className="space-y-4 min-w-0">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <div className="min-w-0 text-sm text-muted-foreground">
          {rows.length} transaction{rows.length !== 1 ? "s" : ""} found
          {duplicateCount > 0 && (
            <span className="text-amber-600 ml-1">
              ({duplicateCount} possible duplicate
              {duplicateCount !== 1 ? "s" : ""})
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleToggleAll(true)}
          >
            Select all
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleToggleAll(false)}
          >
            Deselect all
          </Button>
        </div>
      </div>

      {isMobile ? (
        <div className="space-y-2.5">
          {rows.map((row, index) => (
            <RowEditor
              key={row.id}
              row={row}
              categories={categoryList}
              onChange={(updated) => handleRowChange(index, updated)}
              isMobile
            />
          ))}
        </div>
      ) : (
        <div className="w-full max-w-full overflow-x-auto rounded-lg border max-h-[50vh] overflow-y-auto [&>div]:overflow-visible">
          <Table className="text-xs">
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow className="bg-muted/50">
                <TableHead className="h-auto px-2 py-2 w-8" />
                <TableHead className="h-auto px-2 py-2">Date</TableHead>
                <TableHead className="h-auto px-2 py-2">Description</TableHead>
                <TableHead className="h-auto px-2 py-2">Amount</TableHead>
                <TableHead className="h-auto px-2 py-2">Category</TableHead>
                <TableHead className="h-auto px-2 py-2">Type</TableHead>
                <TableHead className="h-auto px-2 py-2">Conf.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <RowEditor
                  key={row.id}
                  row={row}
                  categories={categoryList}
                  onChange={(updated) => handleRowChange(index, updated)}
                  isMobile={false}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isConfirming || includedCount === 0}
        >
          {isConfirming
            ? "Importing..."
            : `Import ${includedCount} expense${includedCount !== 1 ? "s" : ""}`}
        </Button>
      </div>
    </div>
  );
};

type SmartResultStepProps = {
  result: SmartImportConfirmResult;
  onClose: () => void;
};

export const SmartResultStep = ({ result, onClose }: SmartResultStepProps) => {
  const { imported, failed } = result;
  const isSuccess = imported > 0 && failed === 0;
  const isPartial = imported > 0 && failed > 0;
  const isFailure = imported === 0;

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full ring-1",
            isSuccess && "bg-emerald-500/10 ring-emerald-500/25",
            isPartial && "bg-amber-500/10 ring-amber-500/25",
            isFailure && "bg-destructive/10 ring-destructive/25",
          )}
        >
          {isSuccess && (
            <IconCheck className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          )}
          {isPartial && (
            <IconAlertTriangle className="h-7 w-7 text-amber-600 dark:text-amber-400" />
          )}
          {isFailure && <IconX className="h-7 w-7 text-destructive" />}
        </div>

        <div className="space-y-1">
          <p className="text-xl font-semibold tracking-tight">
            {isSuccess &&
              `${imported} expense${imported !== 1 ? "s" : ""} imported`}
            {isPartial && `${imported} imported, ${failed} failed`}
            {isFailure && "Import failed"}
          </p>
          <p className="mx-auto max-w-xs text-sm text-muted-foreground">
            {isSuccess && "They've been added to your expense list."}
            {isPartial &&
              "The failed rows were skipped — go back to adjust them, or add them manually."}
            {isFailure &&
              "None of the selected rows could be imported. Check the amounts and categories, then try again."}
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={onClose} className="w-full max-w-52">
          Done
        </Button>
      </div>
    </div>
  );
};

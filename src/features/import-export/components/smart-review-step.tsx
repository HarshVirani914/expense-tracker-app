"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { IconAlertTriangle, IconCheck, IconX } from "@tabler/icons-react";
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
          "p-3 space-y-3",
          !row.included && "opacity-60",
          row.possibleDuplicate && "border-amber-500/40",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={row.included}
              onChange={(e) => handleFieldChange("included", e.target.checked)}
              className="rounded"
              aria-label={`Include ${row.description}`}
            />
            Include
          </label>
          <div className="flex items-center gap-1.5">
            <Badge
              variant={confidenceBadgeVariant(row.confidence)}
              className="text-xs"
            >
              {formatConfidence(row.confidence)}
            </Badge>
            {row.possibleDuplicate && (
              <Badge
                variant="outline"
                className="text-xs text-amber-600 border-amber-500/40"
              >
                <IconAlertTriangle className="h-3 w-3 mr-0.5" />
                Duplicate?
              </Badge>
            )}
          </div>
        </div>

        <Input
          value={row.description}
          onChange={(e) => handleFieldChange("description", e.target.value)}
          aria-label="Description"
        />

        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            step="0.01"
            min="0"
            value={row.amount}
            onChange={(e) =>
              handleFieldChange("amount", parseFloat(e.target.value) || 0)
            }
            aria-label="Amount"
          />
          <Input
            type="date"
            value={row.date.slice(0, 10)}
            onChange={(e) =>
              handleFieldChange("date", new Date(e.target.value).toISOString())
            }
            aria-label="Date"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select
            value={row.category}
            onValueChange={(v) => handleFieldChange("category", v)}
          >
            <SelectTrigger aria-label="Category">
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

          <Select
            value={row.type}
            onValueChange={(v) =>
              handleFieldChange("type", v as SmartImportRow["type"])
            }
          >
            <SelectTrigger aria-label="Type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXPENSE">Expense</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select
          value={row.paymentMethod ?? "OTHER"}
          onValueChange={(v) =>
            handleFieldChange(
              "paymentMethod",
              v as SmartImportRow["paymentMethod"],
            )
          }
        >
          <SelectTrigger aria-label="Payment method">
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
      </Card>
    );
  }

  return (
    <tr
      className={cn(
        "border-t",
        !row.included && "opacity-60 bg-muted/30",
        row.possibleDuplicate && "bg-amber-500/5",
      )}
    >
      <td className="px-2 py-2">
        <input
          type="checkbox"
          checked={row.included}
          onChange={(e) => handleFieldChange("included", e.target.checked)}
          className="rounded"
          aria-label={`Include ${row.description}`}
        />
      </td>
      <td className="px-2 py-2">
        <Input
          type="date"
          value={row.date.slice(0, 10)}
          onChange={(e) =>
            handleFieldChange("date", new Date(e.target.value).toISOString())
          }
          className="h-8 text-xs w-32.5"
          aria-label="Date"
        />
      </td>
      <td className="px-2 py-2 min-w-40">
        <Input
          value={row.description}
          onChange={(e) => handleFieldChange("description", e.target.value)}
          className="h-8 text-xs"
          aria-label="Description"
        />
      </td>
      <td className="px-2 py-2">
        <Input
          type="number"
          step="0.01"
          min="0"
          value={row.amount}
          onChange={(e) =>
            handleFieldChange("amount", parseFloat(e.target.value) || 0)
          }
          className="h-8 text-xs w-22.5"
          aria-label="Amount"
        />
      </td>
      <td className="px-2 py-2">
        <Select
          value={row.category}
          onValueChange={(v) => handleFieldChange("category", v)}
        >
          <SelectTrigger className="h-8 text-xs w-30" aria-label="Category">
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
      </td>
      <td className="px-2 py-2">
        <Select
          value={row.type}
          onValueChange={(v) =>
            handleFieldChange("type", v as SmartImportRow["type"])
          }
        >
          <SelectTrigger className="h-8 text-xs w-25" aria-label="Type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="px-2 py-2">
        <Badge
          variant={confidenceBadgeVariant(row.confidence)}
          className="text-xs whitespace-nowrap"
        >
          {formatConfidence(row.confidence)}
        </Badge>
        {row.possibleDuplicate && (
          <Badge
            variant="outline"
            className="text-xs text-amber-600 border-amber-500/40 ml-1 whitespace-nowrap"
          >
            Dup?
          </Badge>
        )}
      </td>
    </tr>
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
  const categoryList = categories ?? [];

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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
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
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
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
        <div className="overflow-x-auto rounded-lg border max-h-[50vh] overflow-y-auto">
          <table className="text-xs w-full">
            <thead className="sticky top-0 bg-background z-10">
              <tr className="bg-muted/50">
                <th className="px-2 py-2 text-left font-medium w-8" />
                <th className="px-2 py-2 text-left font-medium">Date</th>
                <th className="px-2 py-2 text-left font-medium">Description</th>
                <th className="px-2 py-2 text-left font-medium">Amount</th>
                <th className="px-2 py-2 text-left font-medium">Category</th>
                <th className="px-2 py-2 text-left font-medium">Type</th>
                <th className="px-2 py-2 text-left font-medium">Conf.</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <RowEditor
                  key={row.id}
                  row={row}
                  categories={categoryList}
                  onChange={(updated) => handleRowChange(index, updated)}
                  isMobile={false}
                />
              ))}
            </tbody>
          </table>
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
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Imported</p>
              <p className="text-2xl font-bold text-green-600">
                {result.imported}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-red-600">{result.failed}</p>
            </div>
          </div>

          {result.failed === 0 && result.imported > 0 && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <IconCheck className="h-4 w-4" />
              All selected expenses imported successfully
            </div>
          )}

          {result.failed > 0 && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <IconX className="h-4 w-4" />
              Some expenses could not be imported
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

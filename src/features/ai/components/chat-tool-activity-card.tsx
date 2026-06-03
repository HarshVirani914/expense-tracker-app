"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconCheck,
  IconChartPie,
  IconChevronDown,
  IconReceipt,
  IconSearch,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { useState, type ComponentType } from "react";
import { isToolUIPart } from "ai";
import type { ExpenseChatTools } from "@/lib/ai/chat-message";

// ─── Tool metadata ─────────────────────────────────────────────────────────────

type ToolMeta = {
  label: string;
  runningLabel: string;
  icon: ComponentType<{ className?: string }>;
};

const TOOL_META: Record<string, ToolMeta> = {
  queryExpenses: {
    label: "Searched expenses",
    runningLabel: "Searching your expenses",
    icon: IconSearch,
  },
  getSpendingSummary: {
    label: "Fetched spending summary",
    runningLabel: "Calculating your spending",
    icon: IconChartPie,
  },
  createExpense: {
    label: "Preparing expense",
    runningLabel: "Preparing to add expense",
    icon: IconReceipt,
  },
  updateExpense: {
    label: "Preparing update",
    runningLabel: "Preparing to update expense",
    icon: IconEdit,
  },
  deleteExpense: {
    label: "Preparing deletion",
    runningLabel: "Preparing to delete expense",
    icon: IconTrash,
  },
};

function getToolKey(partType: string): string {
  return partType.startsWith("tool-") ? partType.slice("tool-".length) : partType;
}

// ─── Shimmer component ────────────────────────────────────────────────────────

function Shimmer() {
  return (
    <div className="relative overflow-hidden rounded-2xl rounded-bl-sm border border-border/50 bg-muted/40 px-4 py-3">
      {/* Sliding shimmer highlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 -skew-x-12 bg-linear-to-r from-transparent via-white/12 to-transparent dark:via-white/6"
        initial={{ x: "-100%" }}
        animate={{ x: "250%" }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear", repeatDelay: 0.6 }}
      />

      {/* Content skeleton */}
      <div className="flex items-center gap-3">
        {/* Pulsing icon placeholder */}
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/15"
        >
          <div className="h-3.5 w-3.5 rounded-full bg-violet-400/50" />
        </motion.div>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            {/* Animated dot */}
            <motion.span
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block h-1.5 w-1.5 rounded-full bg-violet-500"
            />
            {/* Skeleton text */}
            <div className="h-3.5 w-40 rounded-full bg-muted-foreground/15" />
          </div>
          {/* Shimmer bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-violet-400/30 via-violet-500/50 to-violet-400/30"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Named shimmer (when we know which tool is running) ───────────────────────

function RunningToolCard({ toolKey }: { toolKey: string }) {
  const meta = TOOL_META[toolKey];
  const Icon = meta?.icon ?? IconSearch;
  const label = meta?.runningLabel ?? "Working…";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-2xl rounded-bl-sm border border-border/50 bg-muted/40 px-4 py-3"
    >
      {/* Sliding shimmer */}
      <motion.div
        className="pointer-events-none absolute inset-0 -skew-x-12 bg-linear-to-r from-transparent via-white/12 to-transparent dark:via-white/6"
        initial={{ x: "-100%" }}
        animate={{ x: "250%" }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear", repeatDelay: 0.6 }}
      />

      <div className="flex items-center gap-3">
        {/* Icon with pulse */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/15"
        >
          <Icon className="h-3.5 w-3.5 text-violet-500" />
        </motion.div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500"
            />
            <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
          </div>
          {/* Progress shimmer bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-violet-400/40 via-violet-500/60 to-indigo-400/40"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Completed tool card (expandable) ─────────────────────────────────────────

type ToolOutputSummary = {
  line1: string;
  detail?: string;
};

function getOutputSummary(toolKey: string, output: unknown): ToolOutputSummary {
  if (!output || typeof output !== "object") return { line1: "Done" };
  const o = output as Record<string, unknown>;

  switch (toolKey) {
    case "queryExpenses": {
      const count = typeof o.count === "number" ? o.count : 0;
      return {
        line1: `Found ${count} expense${count !== 1 ? "s" : ""}`,
        detail: count > 0 ? "Results passed to assistant" : "No matching expenses",
      };
    }
    case "getSpendingSummary": {
      const period = typeof o.period === "string" ? o.period : "period";
      return {
        line1: `${period.charAt(0).toUpperCase() + period.slice(1)} summary ready`,
        detail: "Totals passed to assistant",
      };
    }
    default:
      return { line1: "Completed" };
  }
}

function CompletedToolCard({
  toolKey,
  input,
  output,
}: {
  toolKey: string;
  input: unknown;
  output: unknown;
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = TOOL_META[toolKey];
  const Icon = meta?.icon ?? IconSearch;
  const label = meta?.label ?? "Tool completed";
  const summary = getOutputSummary(toolKey, output);

  // Build a readable input summary
  const inputEntries =
    input && typeof input === "object"
      ? Object.entries(input as Record<string, unknown>).filter(
          ([, v]) => v !== undefined && v !== null && v !== "",
        )
      : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="overflow-hidden rounded-2xl rounded-bl-sm border border-border/60 bg-muted/30"
    >
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
          "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        )}
        aria-expanded={expanded}
      >
        {/* Check icon */}
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
          <IconCheck className="h-3 w-3 text-emerald-500" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Icon className="h-3 w-3 shrink-0 text-muted-foreground" />
            <p className="text-xs font-medium text-foreground truncate">{label}</p>
          </div>
          {!expanded && summary.detail && (
            <p className="text-[10px] text-muted-foreground">{summary.detail}</p>
          )}
        </div>

        {/* Expand chevron */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <IconChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Expanded body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 px-4 py-3 space-y-2.5">
              {/* Output summary */}
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Result
                </p>
                <p className="text-xs text-foreground">{summary.line1}</p>
              </div>

              {/* Input parameters */}
              {inputEntries.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Parameters
                  </p>
                  <div className="space-y-0.5">
                    {inputEntries.map(([k, v]) => (
                      <div key={k} className="flex gap-2 text-[11px]">
                        <span className="shrink-0 text-muted-foreground capitalize">
                          {k.replace(/([A-Z])/g, " $1").toLowerCase()}:
                        </span>
                        <span className="truncate text-foreground">
                          {typeof v === "object" ? JSON.stringify(v) : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

type ToolUIPart = ReturnType<typeof isToolUIPart> extends boolean
  ? Parameters<typeof isToolUIPart>[0]
  : never;

type ChatToolActivityCardProps = {
  part: ToolUIPart & { type: keyof { [K in keyof ExpenseChatTools as `tool-${string & K}`]: unknown } | string };
  isRunning: boolean;
};

export function ChatToolActivityCard({ part, isRunning }: ChatToolActivityCardProps) {
  if (!isToolUIPart(part)) return null;

  const toolKey = getToolKey(part.type);

  if (isRunning) {
    // If the input is still streaming we don't know the tool name yet
    if (!toolKey || toolKey === "dynamic-tool") return <Shimmer />;
    return <RunningToolCard toolKey={toolKey} />;
  }

  // Completed, non-approval tool — show expandable result card
  if (part.state === "output-available") {
    const inputData = "input" in part ? (part as { input: unknown }).input : undefined;
    const outputData = "output" in part ? (part as { output: unknown }).output : undefined;
    return (
      <CompletedToolCard
        toolKey={toolKey}
        input={inputData}
        output={outputData}
      />
    );
  }

  return null;
}

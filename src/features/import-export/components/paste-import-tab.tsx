"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { IconMessage, IconSparkles } from "@tabler/icons-react";
import { useState } from "react";

const MAX_TEXT_LENGTH = 10_000;

type PasteImportTabProps = {
  onAnalyze: (text: string) => void;
  isAnalyzing: boolean;
};

export const PasteImportTab = ({
  onAnalyze,
  isAnalyzing,
}: PasteImportTabProps) => {
  const [text, setText] = useState("");

  const handleAnalyze = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAnalyze(trimmed);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-muted/50">
        <div className="flex items-start gap-3">
          <IconMessage className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              Paste one or more bank SMS or payment notifications. AI will
              extract amount, date, merchant, and category for each transaction.
            </p>
            <p className="text-xs">
              Works with UPI debits, card payments, bank transfers, and salary
              credits. OTP and promo messages are automatically ignored.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT_LENGTH))}
          placeholder={`Example:\n\nINR 450.00 debited from A/c XX1234 on 24-Jul-26. UPI/paytm@ybl/Amazon. Avl bal INR 12,450.00\n\nRs.1200.00 spent on HDFC Credit Card ending 5678 at Swiggy on 23/07/26`}
          className="min-h-45 resize-y font-mono text-sm"
          aria-label="Paste bank SMS or payment messages"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {text.length.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()}{" "}
            characters
          </span>
        </div>
      </div>

      <Button
        onClick={handleAnalyze}
        disabled={isAnalyzing || !text.trim()}
        className="w-full gap-2"
      >
        <IconSparkles className="h-4 w-4" />
        {isAnalyzing ? "Analyzing..." : "Analyze Messages"}
      </Button>
    </div>
  );
};

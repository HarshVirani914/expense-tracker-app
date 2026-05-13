"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { IconFilter, IconFilterOff, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { useGroups } from "@/features/groups/hooks/use-groups";
import type { ExpenseFilters } from "../types";
import { ExpenseType } from "@/types/prisma";
import { Badge } from "@/components/ui/badge";

type ExpenseFiltersProps = {
  filters: ExpenseFilters;
  onFiltersChange: (filters: ExpenseFilters) => void;
};

export const ExpenseFiltersBar = ({
  filters,
  onFiltersChange,
}: ExpenseFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { categories } = useCategories();
  const { groups } = useGroups({ page: 1, limit: 100 });

  const handleDateChange = (field: "startDate" | "endDate", date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      [field]: date?.toISOString(),
      page: 1,
    });
  };

  const handleCategoryChange = (categoryId: string | undefined) => {
    onFiltersChange({
      ...filters,
      categoryId: categoryId === "all" ? undefined : categoryId,
      page: 1,
    });
  };

  const handleGroupChange = (groupId: string | undefined) => {
    onFiltersChange({
      ...filters,
      groupId: groupId === "all" ? undefined : groupId,
      page: 1,
    });
  };

  const handleTypeChange = (type: string | undefined) => {
    onFiltersChange({
      ...filters,
      type: type === "all" ? undefined : (type as ExpenseType),
      page: 1,
    });
  };

  const handleSearchChange = (search: string) => {
    onFiltersChange({
      ...filters,
      search: search || undefined,
      page: 1,
    });
  };

  const handleAmountChange = (field: 'minAmount' | 'maxAmount', value: string) => {
    const numValue = value ? parseFloat(value) : undefined
    onFiltersChange({
      ...filters,
      [field]: numValue,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit || 20,
    });
  };

  const hasActiveFilters =
    filters.categoryId ||
    filters.groupId ||
    filters.type ||
    filters.startDate ||
    filters.endDate ||
    filters.search ||
    filters.minAmount !== undefined ||
    filters.maxAmount !== undefined;

  const activeFilterCount = [
    filters.categoryId,
    filters.groupId,
    filters.type,
    filters.startDate,
    filters.endDate,
    filters.search,
    filters.minAmount !== undefined ? 'minAmount' : null,
    filters.maxAmount !== undefined ? 'maxAmount' : null,
  ].filter(Boolean).length;

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <IconFilter className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Filters</h3>
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters
                  ? `${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} active`
                  : "No filters applied"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="gap-2"
              >
                <IconFilterOff className="h-4 w-4" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-2"
            >
              {isExpanded ? (
                <>
                  <IconChevronUp className="h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <IconChevronDown className="h-4 w-4" />
                  Show
                </>
              )}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium">
                Search
              </Label>
              <Input
                id="search"
                placeholder="Search description or notes..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-sm font-medium">
                  From Date
                </Label>
                <DatePicker
                  date={filters.startDate ? new Date(filters.startDate) : undefined}
                  onSelect={(date) => handleDateChange("startDate", date)}
                  placeholder="Select start date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-sm font-medium">
                  To Date
                </Label>
                <DatePicker
                  date={filters.endDate ? new Date(filters.endDate) : undefined}
                  onSelect={(date) => handleDateChange("endDate", date)}
                  placeholder="Select end date"
                />
              </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category
              </Label>
              <Select
                value={filters.categoryId || "all"}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="group" className="text-sm font-medium">
                Group
              </Label>
              <Select
                value={filters.groupId || "all"}
                onValueChange={handleGroupChange}
              >
                <SelectTrigger id="group">
                  <SelectValue placeholder="All expenses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All expenses</SelectItem>
                  <SelectItem value="personal">Personal only</SelectItem>
                  {groups?.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Type
              </Label>
              <Select
                value={filters.type || "all"}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="EXPENSE">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">
                        Expense
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="INCOME">
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs bg-green-600">Income</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="min-amount" className="text-sm font-medium">
                  Min Amount
                </Label>
                <Input
                  id="min-amount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={filters.minAmount || ''}
                  onChange={(e) => handleAmountChange('minAmount', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-amount" className="text-sm font-medium">
                  Max Amount
                </Label>
                <Input
                  id="max-amount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={filters.maxAmount || ''}
                  onChange={(e) => handleAmountChange('maxAmount', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {hasActiveFilters && !isExpanded && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Search: {filters.search}
              </Badge>
            )}
            {filters.startDate && (
              <Badge variant="secondary" className="gap-1">
                From: {new Date(filters.startDate).toLocaleDateString()}
              </Badge>
            )}
            {filters.endDate && (
              <Badge variant="secondary" className="gap-1">
                To: {new Date(filters.endDate).toLocaleDateString()}
              </Badge>
            )}
            {filters.categoryId && (
              <Badge variant="secondary" className="gap-1">
                {categories?.find((c) => c.id === filters.categoryId)?.name}
              </Badge>
            )}
            {filters.groupId && (
              <Badge variant="secondary" className="gap-1">
                {filters.groupId === "personal" 
                  ? "Personal only" 
                  : groups?.find((g) => g.id === filters.groupId)?.name}
              </Badge>
            )}
            {filters.type && (
              <Badge variant="secondary" className="gap-1">
                {filters.type === "EXPENSE" ? "Expenses" : "Income"}
              </Badge>
            )}
            {filters.minAmount !== undefined && (
              <Badge variant="secondary" className="gap-1">
                Min: ₹{filters.minAmount}
              </Badge>
            )}
            {filters.maxAmount !== undefined && (
              <Badge variant="secondary" className="gap-1">
                Max: ₹{filters.maxAmount}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

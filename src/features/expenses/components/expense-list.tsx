import { useConfirmDialog } from "@/components/confirm-dialog";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { IconDotsVertical, IconPencil, IconTrash, IconUsers } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDeleteExpense } from "../hooks/use-delete-expense";
import { useExpenses } from "../hooks/use-expenses";
import type { ExpenseFilters, ExpenseWithRelations } from "../types";

type ExpenseListProps = {
  onEdit: (expense: ExpenseWithRelations) => void;
  filters: ExpenseFilters;
};

export const ExpenseList = ({ onEdit, filters }: ExpenseListProps) => {
  const [page, setPage] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    setPage(0);
  }, [filters.categoryId, filters.type, filters.startDate, filters.endDate]);

  const { expenses, pagination, isLoading } = useExpenses({
    ...filters,
    page: page + 1,
    limit: pageSize,
  });

  const { deleteExpense } = useDeleteExpense();
  const { confirm } = useConfirmDialog();

  const handleDelete = async (id: string, description?: string) => {
    const confirmed = await confirm({
      title: "Delete Expense",
      description: `Are you sure you want to delete ${description ? `"${description}"` : "this expense"}? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (confirmed) {
      try {
        await deleteExpense(id);
        toast.success("Expense deleted successfully");
      } catch {
        toast.error("Failed to delete expense");
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const columns: ColumnDef<ExpenseWithRelations>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => format(new Date(row.original.date), "MMM dd, yyyy"),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-md truncate">
          {row.original.description || "No description"}
        </div>
      ),
    },
    {
      accessorKey: "group",
      header: "Group",
      cell: ({ row }) => {
        if (!row.original.group) {
          return (
            <span className="text-sm text-muted-foreground">Personal</span>
          );
        }
        return (
          <Link href={`/groups/${row.original.group.id}`}>
            <Badge
              variant="outline"
              className="gap-1 hover:bg-accent cursor-pointer"
            >
              <IconUsers className="h-3 w-3" />
              {row.original.group.name}
            </Badge>
          </Link>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          style={{
            borderColor: row.original.category.color,
            color: row.original.category.color,
          }}
        >
          {row.original.category.name}
        </Badge>
      ),
    },
    {
      accessorKey: "account",
      header: "Account",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.account?.name || "No account"}
        </span>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.paymentMethod.replace("_", " ")}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span
          className={`font-medium ${row.original.type === "INCOME" ? "text-green-600" : "text-red-600"}`}
        >
          {row.original.type === "INCOME" ? "+" : "-"}
          {formatCurrency(Number(row.original.amount))}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <IconDotsVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <IconPencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                handleDelete(
                  row.original.id,
                  row.original.description || undefined,
                )
              }
              className="text-red-600"
            >
              <IconTrash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={expenses || []}
      isLoading={isLoading}
      emptyMessage="No expenses found. Create your first expense to get started."
      pagination={
        pagination
          ? {
              pageIndex: page,
              pageSize,
              total: pagination.total,
              onPaginationChange: (pagination) => {
                if (typeof pagination === "function") {
                  const newState = pagination({ pageIndex: page, pageSize });
                  setPage(newState.pageIndex);
                } else {
                  setPage(pagination.pageIndex);
                }
              },
            }
          : undefined
      }
    />
  );
};

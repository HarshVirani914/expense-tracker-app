'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { ExpenseWithRelations } from '@/features/expenses/types'
import { format } from 'date-fns'

type RecentExpensesListProps = {
  expenses: ExpenseWithRelations[]
}

export const RecentExpensesList = ({ expenses }: RecentExpensesListProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No expenses yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium">
                  {format(new Date(expense.date), 'MMM dd')}
                </TableCell>
                <TableCell>{expense.description || 'No description'}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: expense.category.color,
                      color: expense.category.color,
                    }}
                  >
                    {expense.category.name}
                  </Badge>
                </TableCell>
                <TableCell
                  className={`text-right font-medium ${expense.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}
                >
                  {expense.type === 'INCOME' ? '+' : '-'}
                  {formatCurrency(Number(expense.amount))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

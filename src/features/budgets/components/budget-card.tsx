"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconEdit, IconTrash, IconAlertCircle } from "@tabler/icons-react"
import type { BudgetWithSpending } from "../types"
import { cn } from "@/lib/utils"

type BudgetCardProps = {
  budget: BudgetWithSpending
  onEdit?: (budget: BudgetWithSpending) => void
  onDelete?: (id: string) => void
}

export const BudgetCard = ({ budget, onEdit, onDelete }: BudgetCardProps) => {
  const getStatusColor = () => {
    switch (budget.status) {
      case 'safe':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'exceeded':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    switch (budget.status) {
      case 'safe':
        return 'On Track'
      case 'warning':
        return 'Near Limit'
      case 'exceeded':
        return 'Exceeded'
      default:
        return 'Unknown'
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: budget.category.color }}
              />
              <h3 className="font-semibold text-lg">{budget.category.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {budget.period === 'WEEKLY' ? 'Weekly' : 'Monthly'} Budget
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge
              variant={budget.status === 'exceeded' ? 'destructive' : 'secondary'}
              className={cn(
                'gap-1',
                budget.status === 'warning' && 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100'
              )}
            >
              {budget.status === 'exceeded' && <IconAlertCircle className="h-3 w-3" />}
              {getStatusText()}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold">₹{budget.spent.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">of ₹{budget.amount}</p>
          </div>

          <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full transition-all duration-300', getStatusColor())}
              style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              {budget.percentageUsed.toFixed(1)}% used
            </p>
            <p className={cn(
              'font-medium',
              budget.remaining < 0 ? 'text-destructive' : 'text-muted-foreground'
            )}>
              {budget.remaining < 0 ? 'Over by' : 'Remaining'}: ₹{Math.abs(budget.remaining).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(budget)}
              className="flex-1"
            >
              <IconEdit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(budget.id)}
              className="text-destructive hover:text-destructive"
            >
              <IconTrash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

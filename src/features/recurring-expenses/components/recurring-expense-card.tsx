"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconEdit, IconTrash, IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react"
import type { RecurringExpenseWithRelations } from "../types"
import { format } from "date-fns"

type RecurringExpenseCardProps = {
  recurringExpense: RecurringExpenseWithRelations
  onEdit?: (recurringExpense: RecurringExpenseWithRelations) => void
  onDelete?: (id: string) => void
  onToggle?: (id: string) => void
}

export const RecurringExpenseCard = ({
  recurringExpense,
  onEdit,
  onDelete,
  onToggle,
}: RecurringExpenseCardProps) => {
  const getFrequencyLabel = () => {
    switch (recurringExpense.frequency) {
      case 'DAILY':
        return 'Daily'
      case 'WEEKLY':
        return 'Weekly'
      case 'MONTHLY':
        return 'Monthly'
      case 'YEARLY':
        return 'Yearly'
      case 'CUSTOM':
        return `Every ${recurringExpense.customDays} days`
      default:
        return 'Unknown'
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: recurringExpense.category.color }}
              />
              <h3 className="font-semibold text-lg">{recurringExpense.category.name}</h3>
            </div>
            {recurringExpense.description && (
              <p className="text-sm text-muted-foreground">
                {recurringExpense.description}
              </p>
            )}
          </div>
          
          <Badge variant={recurringExpense.isActive ? 'default' : 'secondary'}>
            {recurringExpense.isActive ? 'Active' : 'Paused'}
          </Badge>
        </div>

        <div className="flex items-baseline justify-between pt-2 border-t">
          <div>
            <p className="text-2xl font-bold">
              ₹{recurringExpense.amount}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {getFrequencyLabel()}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Next due</p>
            <p className="text-sm font-medium">
              {format(new Date(recurringExpense.nextDate), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>

        {recurringExpense.account && (
          <div className="text-xs text-muted-foreground">
            Account: {recurringExpense.account.name}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t">
          {onToggle && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggle(recurringExpense.id)}
            >
              {recurringExpense.isActive ? (
                <>
                  <IconPlayerPause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <IconPlayerPlay className="h-4 w-4 mr-2" />
                  Resume
                </>
              )}
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(recurringExpense)}
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
              onClick={() => onDelete(recurringExpense.id)}
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

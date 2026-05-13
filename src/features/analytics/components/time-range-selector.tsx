"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { IconCalendar } from "@tabler/icons-react"
import type { TimeRangeOption, AnalyticsFilters } from "../types"

type TimeRangeSelectorProps = {
  filters: AnalyticsFilters
  onFiltersChange: (filters: AnalyticsFilters) => void
}

const timeRangeOptions: { value: TimeRangeOption; label: string }[] = [
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'this-year', label: 'This Year' },
  { value: 'last-year', label: 'Last Year' },
  { value: 'all-time', label: 'All Time' },
  { value: 'custom', label: 'Custom' },
]

export const TimeRangeSelector = ({ filters, onFiltersChange }: TimeRangeSelectorProps) => {
  const [showCustom, setShowCustom] = useState(filters.timeRange === 'custom')

  const handleTimeRangeChange = (timeRange: TimeRangeOption) => {
    setShowCustom(timeRange === 'custom')
    if (timeRange === 'custom') {
      onFiltersChange({
        ...filters,
        timeRange,
      })
    } else {
      onFiltersChange({
        ...filters,
        timeRange,
        startDate: undefined,
        endDate: undefined,
      })
    }
  }

  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      [field]: date?.toISOString(),
      timeRange: 'custom',
    })
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <IconCalendar className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Time Range</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {timeRangeOptions.map(option => (
            <Button
              key={option.value}
              variant={filters.timeRange === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTimeRangeChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {showCustom && (
          <div className="grid gap-4 pt-2 border-t md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <DatePicker
                date={filters.startDate ? new Date(filters.startDate) : undefined}
                onSelect={(date) => handleDateChange('startDate', date)}
                placeholder="Select start date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <DatePicker
                date={filters.endDate ? new Date(filters.endDate) : undefined}
                onSelect={(date) => handleDateChange('endDate', date)}
                placeholder="Select end date"
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

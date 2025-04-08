"use client"

import * as React from "react"
import dayjs from "dayjs"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type CalendarProps = React.HTMLAttributes<HTMLDivElement> & {
  date?: Date
  onDateChange?: (date: Date) => void
  minDate?: Date
  maxDate?: Date
}

export function Calendar({
  className,
  date,
  onDateChange,
  minDate,
  maxDate,
  ...props
}: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(date || new Date())
  const [currentMonth, setCurrentMonth] = React.useState(dayjs(currentDate).month())
  const [currentYear, setCurrentYear] = React.useState(dayjs(currentDate).year())

  // Update internal state when external date changes
  React.useEffect(() => {
    if (date) {
      setCurrentDate(date)
      setCurrentMonth(dayjs(date).month())
      setCurrentYear(dayjs(date).year())
    }
  }, [date])

  const daysInMonth = dayjs(new Date(currentYear, currentMonth, 1)).daysInMonth()
  const firstDayOfMonth = dayjs(new Date(currentYear, currentMonth, 1)).day()

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day)
    
    // Check if date is within allowed range
    if (minDate && newDate < minDate) return
    if (maxDate && newDate > maxDate) return
    
    setCurrentDate(newDate)
    onDateChange?.(newDate)
  }

  const renderDays = () => {
    const days = []
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

    // Render day names (Su, Mo, Tu, etc)
    for (let i = 0; i < dayNames.length; i++) {
      days.push(
        <div key={`header-${i}`} className="text-center text-xs font-medium text-gray-400 py-2">
          {dayNames[i]}
        </div>
      )
    }

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />)
    }

    // Actual days in month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const isCurrentDate = dayjs(currentDate).isSame(dayjs(date), 'day')
      const isDisabled = (minDate && date < minDate) || (maxDate && date > maxDate)

      days.push(
        <button
          key={`day-${day}`}
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center text-sm",
            isCurrentDate && "bg-blue-600 text-white",
            !isCurrentDate && "hover:bg-gray-100 dark:hover:bg-gray-800",
            isDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent"
          )}
          disabled={isDisabled}
          onClick={() => handleDateSelect(day)}
          type="button"
        >
          {day}
        </button>
      )
    }

    return days
  }

  return (
    <div className={cn("p-3 bg-white dark:bg-gray-950 rounded-md border border-gray-200 dark:border-gray-800 shadow-sm", className)} {...props}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-medium text-sm">
          {dayjs(new Date(currentYear, currentMonth)).format("MMMM YYYY")}
        </h2>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={prevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={nextMonth}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
    </div>
  )
} 
"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

export interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  format?: string
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Select date",
  className,
  disabled = false,
  minDate,
  maxDate,
  format: formatStr = "MM/yyyy",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleDateChange = (date: Date) => {
    onDateChange?.(date)
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Attempt to parse the date from the input
    try {
      // This is a simple MM/YYYY parser
      if (value.match(/^\d{1,2}\/\d{4}$/)) {
        const [month, year] = value.split("/")
        const newDate = new Date(parseInt(year), parseInt(month) - 1, 1)
        
        if (!isNaN(newDate.getTime())) {
          onDateChange?.(newDate)
        }
      }
    } catch (error) {
      // Silently fail on invalid date inputs
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className={cn("relative", className)}>
          <Input
            value={date ? format(date, formatStr) : ""}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "rounded-md",
              disabled && "cursor-not-allowed opacity-50"
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setIsOpen(true)}
            disabled={disabled}
          >
            <CalendarIcon className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          date={date}
          onDateChange={handleDateChange}
          minDate={minDate}
          maxDate={maxDate}
        />
      </PopoverContent>
    </Popover>
  )
} 
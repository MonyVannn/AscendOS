"use client"

import * as React from "react"
import { format, subDays } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePickerWithRange({
  className,
  date: controlledDate,
  onDateChange,
}: React.HTMLAttributes<HTMLDivElement> & {
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
}) {
  const [internalDate, setInternalDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  const date = controlledDate !== undefined ? controlledDate : internalDate;
  const setDate = onDateChange || setInternalDate;

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-auto justify-start text-left font-normal bg-white dark:bg-zinc-950",
              !date && "text-muted-foreground",
              className
            )}
          >
            {date?.from ? (
              date.to ? (
                <div className="flex items-center text-xs">
                  <span className="text-muted-foreground font-medium mr-2 uppercase tracking-wider text-[10px]">From</span>
                  {format(date.from, "MM / dd / yyyy")}
                  <CalendarIcon className="ml-2 mr-4 h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground font-medium mr-2 uppercase tracking-wider text-[10px]">To</span>
                  {format(date.to, "MM / dd / yyyy")}
                  <CalendarIcon className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              ) : (
                <div className="flex items-center text-xs">
                  <span className="text-muted-foreground font-medium mr-2 uppercase tracking-wider text-[10px]">From</span>
                  {format(date.from, "MM / dd / yyyy")}
                  <CalendarIcon className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              )
            ) : (
              <div className="flex items-center text-xs">
                <span>Pick a date range</span>
                <CalendarIcon className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

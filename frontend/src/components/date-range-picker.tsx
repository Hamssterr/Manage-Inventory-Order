"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps {
  className?: string;
  date?: DateRange;
  setDate: (date: DateRange | undefined) => void;
  placeholder?: string;
}

export function DatePickerWithRange({
  className,
  date,
  setDate,
  placeholder = "Chọn ngày",
}: DatePickerWithRangeProps) {
  return (
    <div className={cn("relative flex", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "h-8 min-w-[200px] md:w-[200px] justify-start text-left font-normal rounded-lg bg-white border-slate-200 transition-all shadow-sm",
              !date && "text-muted-foreground",
              date?.from
                ? "pr-8 border-primary/40 bg-primary/5 text-primary"
                : "",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yy")} -{" "}
                  {format(date.to, "dd/MM/yy")}
                </>
              ) : (
                format(date.from, "dd/MM/yy")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 rounded-xl shadow-lg border-slate-100"
          align="start"
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
            locale={vi}
          />
        </PopoverContent>
        {date?.from && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDate(undefined);
            }}
            className="absolute right-11 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-300 hover:text-slate-700 transition-colors z-10"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        )}
      </Popover>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  date: Date;
  resource: string;
  type: "equipment" | "space";
}

interface MiniCalendarProps {
  bookings: Booking[];
}

export function MiniCalendar({ bookings }: MiniCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getBookingsForDay = (date: Date) => {
    return bookings.filter((booking) => isSameDay(booking.date, date));
  };

  const selectedDayBookings = selectedDate
    ? getBookingsForDay(selectedDate)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="h-[480px] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Calendário</CardTitle>
              <CardDescription>Seus próximos agendamentos</CardDescription>
            </div>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden">
          {/* Navegação do mês */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-sm font-semibold capitalize">
              {format(currentDate, "MMMM yyyy", { locale: ptBR })}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Grid do calendário */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
              <div
                key={i}
                className="text-center text-xs text-muted-foreground font-medium py-1"
              >
                {day}
              </div>
            ))}
            {days.map((day, dayIdx) => {
              const dayBookings = getBookingsForDay(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());

              return (
                <motion.button
                  key={day.toString()}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "relative p-2 text-sm rounded-md transition-colors",
                    !isSameMonth(day, currentDate) &&
                      "text-muted-foreground opacity-50",
                    isSelected && "bg-primary text-primary-foreground",
                    isToday && !isSelected && "bg-accent",
                    dayBookings.length > 0 && !isSelected && "font-semibold",
                    "hover:bg-accent"
                  )}
                >
                  {format(day, "d")}
                  {dayBookings.length > 0 && (
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {dayBookings.slice(0, 3).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1 w-1 rounded-full",
                            isSelected ? "bg-primary-foreground" : "bg-primary"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Agendamentos do dia selecionado */}
          <div className="flex-1 min-h-0">
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t pt-4 h-full"
              >
                <h4 className="text-sm font-medium mb-2">
                  {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                </h4>
                {selectedDayBookings.length > 0 ? (
                  <div className="space-y-2 overflow-y-auto">
                    {selectedDayBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="truncate">{booking.resource}</span>
                        <Badge
                          variant={
                            booking.type === "equipment"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {booking.type === "equipment"
                            ? "Equipamento"
                            : "Espaço"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum agendamento neste dia
                  </p>
                )}
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

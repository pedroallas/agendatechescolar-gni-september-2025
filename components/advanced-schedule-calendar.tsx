"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameMonth,
  startOfDay,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  parseISO,
  addHours,
  isAfter,
  isBefore,
} from "date-fns";
import { ptBR } from "date-fns/locale";
// Temporariamente removendo drag and drop para correção de bugs
// import { DndProvider } from "react-dnd";
// import { HTML5Backend } from "react-dnd-html5-backend";
// import { useDrag, useDrop } from "react-dnd";
// import type { DropTargetMonitor, DragSourceMonitor } from "react-dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Clock,
  User,
  MapPin,
  AlertCircle,
  CheckCircle,
  X,
  Edit,
  Trash,
  Lightbulb,
  Repeat,
  Move,
} from "lucide-react";
import { useTimeBlocks } from "@/hooks/use-time-blocks";
import { useResources } from "@/hooks/use-resources";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

type ViewMode = "month" | "week" | "day";

interface Booking {
  id: string;
  resourceId: string;
  userId: string;
  timeBlockId: string;
  date: string;
  purpose: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  isRecurring?: boolean;
  recurringPattern?: {
    type: "daily" | "weekly" | "monthly";
    interval: number;
    endDate?: string;
    daysOfWeek?: number[];
  };
  resource: {
    name: string;
    type: string;
    category: string;
    location: string;
  };
  timeBlock: {
    startTime: string;
    endTime: string;
    label: string;
  };
  user: {
    name: string;
    email: string;
    role: string;
  };
}

interface SmartSuggestion {
  timeBlockId: string;
  resourceId: string;
  date: string;
  reason: string;
  confidence: number;
}

interface AdvancedScheduleCalendarProps {
  initialDate?: Date;
  onBookingCreate?: (booking: Booking) => void;
  onBookingUpdate?: (booking: Booking) => void;
  onBookingDelete?: (bookingId: string) => void;
}

// Drag and Drop Types
const ItemTypes = {
  BOOKING: "booking",
};

// Booking Component (drag and drop temporarily disabled)
function BookingComponent({
  booking,
  onEdit,
}: {
  booking: Booking;
  onEdit: (booking: Booking) => void;
}) {
  // Temporarily disabled drag and drop
  // const [{ isDragging }, drag] = useDrag(() => ({
  //   type: ItemTypes.BOOKING,
  //   item: { booking },
  //   collect: (monitor) => ({
  //     isDragging: monitor.isDragging(),
  //   }),
  // }));

  return (
    <div className="cursor-pointer" onClick={() => onEdit(booking)}>
      <div
        className={`rounded-md text-xs border-l-4 hover:shadow-md dark:hover:shadow-lg transition-shadow p-2 ${
          booking.status === "confirmed"
            ? "bg-green-50 dark:bg-gray-800/60 border-green-400 dark:border-green-500 text-green-800 dark:text-green-200"
            : booking.status === "pending"
            ? "bg-yellow-50 dark:bg-gray-800/60 border-yellow-400 dark:border-yellow-500 text-yellow-800 dark:text-yellow-200"
            : booking.status === "cancelled"
            ? "bg-red-50 dark:bg-gray-800/60 border-red-400 dark:border-red-500 text-red-800 dark:text-red-200"
            : "bg-blue-50 dark:bg-gray-800/60 border-blue-400 dark:border-blue-500 text-blue-800 dark:text-blue-200"
        }`}
      >
        <div className="flex items-center gap-1 mb-1">
          <Move className="h-3 w-3" />
          <span className="font-medium">{booking.resource.name}</span>
          {booking.isRecurring && <Repeat className="h-3 w-3" />}
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3" />
          <span>
            {booking.timeBlock.startTime} - {booking.timeBlock.endTime}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs mt-1">
          <User className="h-3 w-3" />
          <span>{booking.user.name}</span>
        </div>
      </div>
    </div>
  );
}

// Drop Target Component (temporarily disabled)
// function DropTarget({
//   date,
//   timeBlockId,
//   resourceId,
//   onDrop,
//   children,
// }: {
//   date: Date;
//   timeBlockId?: string;
//   resourceId?: string;
//   onDrop: (
//     booking: Booking,
//     newDate: Date,
//     newTimeBlockId?: string,
//     newResourceId?: string
//   ) => void;
//   children: React.ReactNode;
// }) {
//   const [{ isOver }, drop] = useDrop(() => ({
//     accept: ItemTypes.BOOKING,
//     drop: (item: { booking: Booking }) => {
//       onDrop(item.booking, date, timeBlockId, resourceId);
//     },
//     collect: (monitor) => ({
//       isOver: monitor.isOver(),
//     }),
//   }));

//   return (
//     <div
//       ref={drop}
//       className={`min-h-[80px] ${
//         isOver ? "bg-blue-100 border-2 border-blue-300 border-dashed" : ""
//       }`}
//     >
//       {children}
//     </div>
//   );
// }

export function AdvancedScheduleCalendar({
  initialDate = new Date(),
  onBookingCreate,
  onBookingUpdate,
  onBookingDelete,
}: AdvancedScheduleCalendarProps) {
  // Error boundary state
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Error handler
  const handleError = (error: Error, errorInfo?: any) => {
    console.error("Calendar Error:", error, errorInfo);
    setHasError(true);
    setErrorMessage(error.message);
  };

  // Reset error state
  const resetError = () => {
    setHasError(false);
    setErrorMessage("");
  };

  // If there's an error, show error UI
  if (hasError) {
    return (
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Erro no Calendário</h3>
            <p className="text-sm text-gray-600 mt-2">{errorMessage}</p>
          </div>
          <Button onClick={resetError} variant="outline">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }
  // State Management - sempre iniciar na semana atual
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>(
    []
  );

  // Filters
  const [resourceFilter, setResourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("");
  const [showOnlyMyBookings, setShowOnlyMyBookings] = useState(false);

  // Modal States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isTimeSlotFixed, setIsTimeSlotFixed] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    resourceId: "",
    timeBlockId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    purpose: "",
    status: undefined as
      | "pending"
      | "confirmed"
      | "completed"
      | "cancelled"
      | undefined,
    isRecurring: false,
    recurringType: "weekly" as "daily" | "weekly" | "monthly",
    recurringInterval: 1,
    recurringEndDate: "",
    recurringDaysOfWeek: [] as number[],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  // Hooks
  const { timeBlocks, isLoading: isLoadingTimeBlocks } = useTimeBlocks();
  const { resources, isLoading: isLoadingResources } = useResources();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const { toast } = useToast();

  // Computed Values
  const startDate = useMemo(() => {
    switch (viewMode) {
      case "month":
        return startOfMonth(currentDate);
      case "week":
        return startOfWeek(currentDate, { locale: ptBR });
      case "day":
        return startOfDay(currentDate);
    }
  }, [currentDate, viewMode]);

  const endDate = useMemo(() => {
    switch (viewMode) {
      case "month":
        return endOfMonth(currentDate);
      case "week":
        return endOfWeek(currentDate, { locale: ptBR });
      case "day":
        return startOfDay(currentDate);
    }
  }, [currentDate, viewMode]);

  const visibleDates = useMemo(() => {
    const dates = [];
    let current = startDate;

    switch (viewMode) {
      case "month":
        const monthStart = startOfWeek(startOfMonth(currentDate), {
          locale: ptBR,
        });
        const monthEnd = endOfWeek(endOfMonth(currentDate), { locale: ptBR });
        current = monthStart;
        while (current <= monthEnd) {
          dates.push(new Date(current));
          current = addDays(current, 1);
        }
        break;
      case "week":
        for (let i = 0; i < 7; i++) {
          dates.push(addDays(current, i));
        }
        break;
      case "day":
        dates.push(current);
        break;
    }

    return dates;
  }, [currentDate, viewMode, startDate]);

  // Effects
  useEffect(() => {
    try {
      if (user && !isLoadingAuth) {
        fetchBookings();
      }
    } catch (error) {
      console.error("Erro ao inicializar bookings:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados iniciais",
        variant: "destructive",
      });
    }
  }, [startDate, endDate, user?.id]);

  useEffect(() => {
    try {
      if (bookings.length >= 0) {
        applyFilters();
      }
    } catch (error) {
      console.error("Erro ao aplicar filtros:", error);
    }
  }, [bookings, resourceFilter, statusFilter, userFilter, showOnlyMyBookings]);

  // Smart Suggestions Algorithm
  const generateSmartSuggestions = useCallback(
    (resourceId: string, preferredDate: Date) => {
      const suggestions: SmartSuggestion[] = [];
      const availableTimeBlocks = timeBlocks.filter((tb) => {
        const dateStr = format(preferredDate, "yyyy-MM-dd");
        return !bookings.some(
          (b) =>
            b.resourceId === resourceId &&
            b.timeBlockId === tb.id &&
            b.date === dateStr &&
            b.status !== "cancelled"
        );
      });

      // Algorithm 1: Similar time preferences based on user history
      const userBookings = bookings.filter((b) => b.userId === user?.id);
      const commonTimeBlocks = userBookings.reduce((acc, booking) => {
        acc[booking.timeBlockId] = (acc[booking.timeBlockId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      availableTimeBlocks.forEach((timeBlock) => {
        const confidence =
          ((commonTimeBlocks[timeBlock.id] || 0) / userBookings.length) * 100;
        if (confidence > 20) {
          suggestions.push({
            timeBlockId: timeBlock.id,
            resourceId,
            date: format(preferredDate, "yyyy-MM-dd"),
            reason: `Você costuma agendar neste horário (${confidence.toFixed(
              0
            )}% das vezes)`,
            confidence: confidence,
          });
        }
      });

      // Algorithm 2: Low-usage time slots
      const timeBlockUsage = bookings.reduce((acc, booking) => {
        acc[booking.timeBlockId] = (acc[booking.timeBlockId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      availableTimeBlocks.forEach((timeBlock) => {
        const usage = timeBlockUsage[timeBlock.id] || 0;
        const totalSlots = bookings.filter(
          (b) => b.timeBlockId === timeBlock.id
        ).length;
        const usageRate = totalSlots > 0 ? (usage / totalSlots) * 100 : 0;

        if (usageRate < 30) {
          suggestions.push({
            timeBlockId: timeBlock.id,
            resourceId,
            date: format(preferredDate, "yyyy-MM-dd"),
            reason: `Horário com baixa utilização (${usageRate.toFixed(
              0
            )}% ocupado)`,
            confidence: 100 - usageRate,
          });
        }
      });

      // Algorithm 3: Adjacent time slots for longer activities
      const adjacentSlots = availableTimeBlocks.filter((timeBlock, index) => {
        const nextTimeBlock = availableTimeBlocks[index + 1];
        if (!nextTimeBlock) return false;

        const currentEnd = timeBlock.endTime;
        const nextStart = nextTimeBlock.startTime;
        return currentEnd === nextStart;
      });

      adjacentSlots.forEach((timeBlock) => {
        suggestions.push({
          timeBlockId: timeBlock.id,
          resourceId,
          date: format(preferredDate, "yyyy-MM-dd"),
          reason: "Horário consecutivo disponível para atividades longas",
          confidence: 80,
        });
      });

      return suggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);
    },
    [timeBlocks, bookings, user?.id]
  );

  // Função para calcular horários disponíveis para um recurso em uma data específica
  const getAvailableTimeSlots = useCallback(
    (resourceId: string, date: string) => {
      if (!resourceId || !date) {
        console.log("⏰ getAvailableTimeSlots: Missing params", {
          resourceId,
          date,
        });
        return [];
      }

      // Usar format para garantir consistência no formato da data
      const dateStr = format(parseISO(date), "yyyy-MM-dd");

      // Filtrar agendamentos para esta data, recurso e não cancelados
      const bookingsForDate = bookings.filter((booking) => {
        const bookingDateStr =
          typeof booking.date === "string"
            ? booking.date.split("T")[0]
            : format(new Date(booking.date), "yyyy-MM-dd");

        return (
          booking.resourceId === resourceId &&
          bookingDateStr === dateStr &&
          booking.status !== "cancelled"
        );
      });

      const occupiedTimeBlocks = bookingsForDate.map(
        (booking) => booking.timeBlockId
      );

      const availableSlots = timeBlocks
        .filter((timeBlock) => !occupiedTimeBlocks.includes(timeBlock.id))
        .map((timeBlock) => timeBlock.id);

      // Debug log para disponibilidade
      console.log("⏰ getAvailableTimeSlots:", {
        resourceId,
        date: dateStr,
        totalBookings: bookings.length,
        bookingsForDate: bookingsForDate.length,
        occupiedTimeBlocks,
        totalTimeBlocks: timeBlocks.length,
        availableSlots: availableSlots.length,
        bookingDetails: bookingsForDate.map((b) => ({
          id: b.id,
          timeBlockId: b.timeBlockId,
          status: b.status,
          date:
            typeof b.date === "string"
              ? b.date.split("T")[0]
              : format(new Date(b.date), "yyyy-MM-dd"),
        })),
      });

      return availableSlots;
    },
    [bookings, timeBlocks]
  );

  // Função para atualizar horários disponíveis quando recurso ou data mudam
  const updateAvailableTimeSlots = useCallback(() => {
    if (formData.resourceId && formData.date) {
      const available = getAvailableTimeSlots(
        formData.resourceId,
        formData.date
      );
      setAvailableTimeSlots(available);
      setShowSuggestions(true);
    } else {
      setAvailableTimeSlots([]);
      setShowSuggestions(false);
    }
  }, [formData.resourceId, formData.date, bookings, getAvailableTimeSlots]);

  // Atualizar horários disponíveis quando os dados relevantes mudarem
  useEffect(() => {
    updateAvailableTimeSlots();
  }, [updateAvailableTimeSlots]);

  // API Functions
  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const res = await fetch(`/api/bookings?${params}`);
      if (!res.ok) throw new Error("Falha ao carregar agendamentos");

      const data = await res.json();

      // Verificar se data é um array válido
      if (Array.isArray(data)) {
        setBookings(data);
        // Log apenas se há agendamentos ou se houve mudança significativa
        if (data.length > 0) {
          console.log("📊 Loaded bookings:", {
            count: data.length,
            sample: data.slice(0, 2).map((b: any) => ({
              id: b.id,
              date: b.date,
              status: b.status,
              resource: b.resource?.name,
              requiresApproval: b.resource?.requiresApproval,
            })),
          });
        }
      } else {
        console.error("❌ Data is not an array:", data);
        setBookings([]);
      }
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar agendamentos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Drag and Drop Handler
  const handleBookingDrop = useCallback(
    async (
      booking: Booking,
      newDate: Date,
      newTimeBlockId?: string,
      newResourceId?: string
    ) => {
      try {
        const updateData = {
          date: format(newDate, "yyyy-MM-dd"),
          ...(newTimeBlockId && { timeBlockId: newTimeBlockId }),
          ...(newResourceId && { resourceId: newResourceId }),
        };

        const res = await fetch(`/api/bookings/${booking.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Falha ao reagendar");
        }

        toast({
          title: "Sucesso",
          description: "Agendamento reagendado com sucesso!",
        });

        fetchBookings();
        if (onBookingUpdate) {
          const updatedBooking = await res.json();
          onBookingUpdate(updatedBooking);
        }
      } catch (error) {
        console.error("Erro ao reagendar:", error);
        toast({
          title: "Erro",
          description:
            error instanceof Error
              ? error.message
              : "Falha ao reagendar agendamento",
          variant: "destructive",
        });
      }
    },
    [fetchBookings, onBookingUpdate]
  );

  const createBooking = async () => {
    setIsSubmitting(true);
    try {
      // Validar se o usuário está autenticado
      if (!user?.id) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado. Faça login novamente.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Validação tripla para evitar conflitos
      console.log("🔍 Triple validation check:", {
        resourceId: formData.resourceId,
        timeBlockId: formData.timeBlockId,
        date: formData.date,
        availableTimeSlots: availableTimeSlots.length,
        isInAvailableList: availableTimeSlots.includes(formData.timeBlockId),
      });

      // 1ª Verificação: Lista de horários disponíveis local
      if (!availableTimeSlots.includes(formData.timeBlockId)) {
        console.log("❌ Failed first check - not in available list");
        await fetchBookings();
        const updatedAvailable = getAvailableTimeSlots(
          formData.resourceId,
          formData.date
        );
        setAvailableTimeSlots(updatedAvailable);

        if (!updatedAvailable.includes(formData.timeBlockId)) {
          setFormData((prev) => ({ ...prev, timeBlockId: "" }));
          toast({
            title: "Horário não disponível",
            description:
              "Este horário não está mais disponível. Selecione outro horário.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // 2ª Verificação: Verificação direta de conflitos
      await fetchBookings(); // Garantir dados mais recentes
      if (
        !isSlotAvailable(
          formData.resourceId,
          formData.timeBlockId,
          formData.date
        )
      ) {
        console.log("❌ Failed second check - isSlotAvailable returned false");
        setFormData((prev) => ({ ...prev, timeBlockId: "" }));
        toast({
          title: "Conflito de agendamento",
          description:
            "Este horário foi ocupado por outro usuário. Selecione um horário diferente.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log("✅ All validation checks passed - proceeding with creation");

      // Filtrar campos undefined para deixar o backend decidir
      const { status, ...formDataWithoutStatus } = formData;

      const bookingData = {
        ...formDataWithoutStatus,
        userId: user?.id,
        ...(formData.isRecurring && {
          recurringPattern: {
            type: formData.recurringType,
            interval: formData.recurringInterval,
            endDate: formData.recurringEndDate,
            daysOfWeek: formData.recurringDaysOfWeek,
          },
        }),
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!res.ok) {
        const error = await res.json();

        // Se o erro for de usuário não encontrado, forçar logout
        if (error.forceLogout) {
          toast({
            title: "Sessão Expirada",
            description: error.error,
            variant: "destructive",
          });
          // Forçar logout
          window.location.href = "/api/auth/signout";
          return;
        }

        // Tratamento especial para erro 409 (conflito de agendamento)
        if (res.status === 409) {
          console.log("❌ Backend returned 409 - booking conflict detected");
          // Limpar seleção de horário e recarregar dados
          setFormData((prev) => ({ ...prev, timeBlockId: "" }));
          await fetchBookings();

          toast({
            title: "Horário já ocupado",
            description:
              "Este horário foi ocupado por outro usuário durante a reserva. Por favor, selecione outro horário disponível.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        throw new Error(error.error || "Falha ao criar agendamento");
      }

      const booking = await res.json();

      // Adicionar o novo agendamento imediatamente ao estado local
      setBookings((prev) => [...prev, booking]);

      // Verificar se o agendamento está dentro do período visível
      const bookingDate = new Date(booking.date);
      const isInVisibleRange =
        bookingDate >= startDate && bookingDate <= endDate;

      // Se não estiver visível, navegar para a data do agendamento
      if (!isInVisibleRange) {
        setCurrentDate(bookingDate);
      }

      toast({
        title: "Sucesso",
        description: formData.isRecurring
          ? "Agendamento recorrente criado com sucesso!"
          : "Agendamento criado com sucesso!",
      });

      closeModal();

      // Atualizar a lista completa em background para garantir sincronização
      fetchBookings();

      if (onBookingCreate) onBookingCreate(booking);
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Falha ao criar agendamento",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateBooking = async () => {
    if (!selectedBooking) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Falha ao atualizar agendamento");
      }

      const updatedBooking = await res.json();

      // Atualizar o agendamento no estado local
      setBookings((prev) =>
        prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
      );

      // Verificar se o agendamento atualizado está dentro do período visível
      const bookingDate = new Date(updatedBooking.date);
      const isInVisibleRange =
        bookingDate >= startDate && bookingDate <= endDate;

      // Se não estiver visível, navegar para a data do agendamento
      if (!isInVisibleRange) {
        setCurrentDate(bookingDate);
      }

      toast({
        title: "Sucesso!",
        description: "Agendamento atualizado com sucesso",
      });

      closeModal();
      onBookingUpdate?.(updatedBooking);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Falha ao cancelar agendamento");

      setBookings((prev) => prev.filter((b) => b.id !== bookingId));

      toast({
        title: "Sucesso!",
        description: "Agendamento cancelado com sucesso",
      });

      onBookingDelete?.(bookingId);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Helper Functions
  const applyFilters = () => {
    let filtered = bookings;

    if (resourceFilter !== "all") {
      filtered = filtered.filter(
        (booking) => booking.resource.category === resourceFilter
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    if (userFilter.trim()) {
      filtered = filtered.filter(
        (booking) =>
          booking.user.name.toLowerCase().includes(userFilter.toLowerCase()) ||
          booking.user.email.toLowerCase().includes(userFilter.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");

    // Se o usuário ainda não foi carregado, retornar array vazio
    if (!user) {
      return [];
    }

    const bookingsForDate = filteredBookings.filter((booking) => {
      // Normalizar as datas para comparação
      const bookingDateStr =
        typeof booking.date === "string"
          ? booking.date.split("T")[0] // Se vier com timestamp, pegar só a data
          : format(new Date(booking.date), "yyyy-MM-dd");

      // Filtrar apenas agendamentos do usuário atual
      const isCurrentUser = booking.userId === user.id;

      return bookingDateStr === dateStr && isCurrentUser;
    });

    return bookingsForDate;
  };

  const getBookingColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.resourceId) errors.resourceId = "Selecione um recurso";
    if (!formData.timeBlockId) errors.timeBlockId = "Selecione um horário";
    if (!formData.date) errors.date = "Selecione uma data";
    if (!formData.purpose.trim())
      errors.purpose = "Descreva o propósito do agendamento";

    // Verificar se o horário selecionado está na lista de disponíveis
    if (
      !isEditMode &&
      formData.timeBlockId &&
      !availableTimeSlots.includes(formData.timeBlockId)
    ) {
      errors.timeBlockId =
        "Este horário não está mais disponível. Selecione outro horário da lista.";
    }

    if (formData.isRecurring) {
      if (!formData.recurringEndDate)
        errors.recurringEndDate = "Selecione data final da recorrência";
      if (
        formData.recurringType === "weekly" &&
        formData.recurringDaysOfWeek.length === 0
      ) {
        errors.recurringDaysOfWeek = "Selecione pelo menos um dia da semana";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Função para verificar se um slot está disponível
  const isSlotAvailable = useCallback(
    (resourceId: string, timeBlockId: string, date: string) => {
      // Usar format para garantir consistência no formato da data
      const dateStr = format(parseISO(date), "yyyy-MM-dd");

      const conflictingBookings = bookings.filter((booking) => {
        const bookingDateStr =
          typeof booking.date === "string"
            ? booking.date.split("T")[0]
            : format(new Date(booking.date), "yyyy-MM-dd");

        return (
          booking.resourceId === resourceId &&
          booking.timeBlockId === timeBlockId &&
          bookingDateStr === dateStr &&
          booking.status !== "cancelled"
        );
      });

      console.log("🔍 isSlotAvailable check:", {
        resourceId,
        timeBlockId,
        date: dateStr,
        conflictingBookings: conflictingBookings.length,
        available: conflictingBookings.length === 0,
        conflicts: conflictingBookings.map((b) => ({
          id: b.id,
          date:
            typeof b.date === "string"
              ? b.date.split("T")[0]
              : format(new Date(b.date), "yyyy-MM-dd"),
          status: b.status,
        })),
      });

      return conflictingBookings.length === 0;
    },
    [bookings]
  );

  // Função para obter recursos disponíveis para um horário específico
  const getAvailableResourcesForTimeSlot = useCallback(
    (timeBlockId: string, date: string) => {
      if (!timeBlockId || !date) return [];

      console.log("🔍 Checking available resources for:", {
        timeBlockId,
        date,
      });

      const availableResources = resources.filter((resource) => {
        const available = isSlotAvailable(resource.id, timeBlockId, date);
        console.log(
          `📋 Resource ${resource.name}: ${
            available ? "✅ Available" : "❌ Occupied"
          }`
        );
        return available;
      });

      console.log(
        `🎯 Total available resources: ${availableResources.length}/${resources.length}`
      );
      return availableResources;
    },
    [resources, isSlotAvailable]
  );

  // Função para verificar se é final de semana
  const isWeekend = (date: Date) => {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0 = domingo, 6 = sábado
  };

  // Função para verificar se a data é no passado
  const isPastDate = (date: Date) => {
    const today = startOfDay(new Date());
    const checkDate = startOfDay(date);
    return isBefore(checkDate, today);
  };

  const openBookingModal = (
    date?: Date,
    timeBlockId?: string,
    resourceId?: string
  ) => {
    // Verificar se a data é no passado
    if (date && isPastDate(date)) {
      toast({
        title: "Agendamento não permitido",
        description: "Não é possível fazer agendamentos para datas passadas.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se é final de semana
    if (date && isWeekend(date)) {
      toast({
        title: "Agendamento não permitido",
        description:
          "Não é possível fazer agendamentos aos sábados e domingos.",
        variant: "destructive",
      });
      return;
    }

    // Se foi clicado em um slot específico (horário definido), verificar disponibilidade
    const isTimeSlotFixed = !!(date && timeBlockId);

    if (date && timeBlockId && resourceId) {
      const dateStr = format(date, "yyyy-MM-dd");
      if (!isSlotAvailable(resourceId, timeBlockId, dateStr)) {
        toast({
          title: "Horário não disponível",
          description:
            "Este horário já está ocupado. Escolha outro recurso ou horário.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsEditMode(false);
    setSelectedBooking(null);
    setFormData({
      resourceId: resourceId || "",
      timeBlockId: timeBlockId || "",
      date: date ? format(date, "yyyy-MM-dd") : "",
      purpose: "",
      status: undefined, // Deixar o backend decidir o status baseado no requiresApproval
      isRecurring: false,
      recurringType: "weekly",
      recurringInterval: 1,
      recurringEndDate: "",
      recurringDaysOfWeek: [],
    });
    setFormErrors({});

    // Guardar se o horário está fixo (clicou em slot específico)
    setIsTimeSlotFixed(isTimeSlotFixed);

    if (resourceId && date) {
      const suggestions = generateSmartSuggestions(resourceId, date);
      setSmartSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    }

    setIsBookingModalOpen(true);
  };

  const openEditModal = (booking: Booking) => {
    setIsEditMode(true);
    setSelectedBooking(booking);
    setFormData({
      resourceId: booking.resourceId,
      timeBlockId: booking.timeBlockId,
      date: booking.date,
      purpose: booking.purpose,
      status: booking.status,
      isRecurring: booking.isRecurring || false,
      recurringType: booking.recurringPattern?.type || "weekly",
      recurringInterval: booking.recurringPattern?.interval || 1,
      recurringEndDate: booking.recurringPattern?.endDate || "",
      recurringDaysOfWeek: booking.recurringPattern?.daysOfWeek || [],
    });
    setFormErrors({});
    setIsBookingModalOpen(true);
  };

  const closeModal = () => {
    setIsBookingModalOpen(false);
    setIsEditMode(false);
    setSelectedBooking(null);
    setIsTimeSlotFixed(false);
    setFormData({
      resourceId: "",
      timeBlockId: "",
      date: format(new Date(), "yyyy-MM-dd"),
      purpose: "",
      status: undefined, // Deixar o backend decidir o status baseado no requiresApproval
      isRecurring: false,
      recurringType: "weekly",
      recurringInterval: 1,
      recurringEndDate: "",
      recurringDaysOfWeek: [],
    });
    setFormErrors({});
    setSmartSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (isEditMode && selectedBooking) {
      await updateBooking();
    } else {
      await createBooking();
    }
  };

  // Navigation functions
  const navigatePrevious = () => {
    switch (viewMode) {
      case "month":
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case "day":
        setCurrentDate(addDays(currentDate, -1));
        break;
    }
  };

  const navigateNext = () => {
    switch (viewMode) {
      case "month":
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "day":
        setCurrentDate(addDays(currentDate, 1));
        break;
    }
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  // Render functions
  const renderCalendarHeader = () => {
    const formatTitle = () => {
      switch (viewMode) {
        case "month":
          return format(currentDate, "MMMM yyyy", { locale: ptBR });
        case "week":
          const weekStart = startOfWeek(currentDate, { locale: ptBR });
          const weekEnd = endOfWeek(currentDate, { locale: ptBR });
          return `${format(weekStart, "dd MMM", { locale: ptBR })} - ${format(
            weekEnd,
            "dd MMM yyyy",
            { locale: ptBR }
          )}`;
        case "day":
          return format(currentDate, "dd 'de' MMMM 'de' yyyy", {
            locale: ptBR,
          });
      }
    };

    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={navigatePrevious}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={navigateToday}
              className="h-8 px-3"
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={navigateNext}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-xl font-semibold capitalize">{formatTitle()}</h2>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={viewMode}
            onValueChange={(value: ViewMode) => setViewMode(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Dia</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => openBookingModal(new Date())}
            className="h-8 px-3"
          >
            <Plus className="h-4 w-4 mr-1" />
            Agendar
          </Button>
        </div>
      </div>
    );
  };

  const renderSmartSuggestions = () => {
    if (!showSuggestions || smartSuggestions.length === 0) return null;

    return (
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium text-blue-900">Sugestões Inteligentes</h3>
        </div>
        <div className="space-y-2">
          {smartSuggestions.map((suggestion, index) => {
            const timeBlock = timeBlocks.find(
              (tb) => tb.id === suggestion.timeBlockId
            );
            return (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-white rounded border cursor-pointer hover:bg-blue-50"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    timeBlockId: suggestion.timeBlockId,
                    date: suggestion.date,
                  }));
                  setShowSuggestions(false);
                }}
              >
                <div>
                  <div className="font-medium text-sm">
                    {timeBlock?.label} ({timeBlock?.startTime} -{" "}
                    {timeBlock?.endTime})
                  </div>
                  <div className="text-xs text-gray-600">
                    {suggestion.reason}
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {suggestion.confidence.toFixed(0)}% match
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderRecurringOptions = () => {
    if (!formData.isRecurring) return null;

    return (
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium flex items-center gap-2">
          <Repeat className="h-4 w-4" />
          Configurações de Recorrência
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recurringType">Tipo de Recorrência</Label>
            <Select
              value={formData.recurringType}
              onValueChange={(value: "daily" | "weekly" | "monthly") =>
                setFormData((prev) => ({ ...prev, recurringType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diariamente</SelectItem>
                <SelectItem value="weekly">Semanalmente</SelectItem>
                <SelectItem value="monthly">Mensalmente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="recurringInterval">Intervalo</Label>
            <Input
              type="number"
              min="1"
              max="10"
              value={formData.recurringInterval}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  recurringInterval: parseInt(e.target.value) || 1,
                }))
              }
            />
          </div>
        </div>

        {formData.recurringType === "weekly" && (
          <div>
            <Label>Dias da Semana</Label>
            <div className="flex gap-2 mt-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                (day, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${index}`}
                      checked={formData.recurringDaysOfWeek.includes(index)}
                      onCheckedChange={(checked) => {
                        setFormData((prev) => ({
                          ...prev,
                          recurringDaysOfWeek: checked
                            ? [...prev.recurringDaysOfWeek, index]
                            : prev.recurringDaysOfWeek.filter(
                                (d) => d !== index
                              ),
                        }));
                      }}
                    />
                    <Label htmlFor={`day-${index}`} className="text-sm">
                      {day}
                    </Label>
                  </div>
                )
              )}
            </div>
            {formErrors.recurringDaysOfWeek && (
              <p className="text-sm text-red-600 mt-1">
                {formErrors.recurringDaysOfWeek}
              </p>
            )}
          </div>
        )}

        <div>
          <Label htmlFor="recurringEndDate">Data Final</Label>
          <Input
            type="date"
            value={formData.recurringEndDate}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                recurringEndDate: e.target.value,
              }))
            }
            min={formData.date}
          />
          {formErrors.recurringEndDate && (
            <p className="text-sm text-red-600 mt-1">
              {formErrors.recurringEndDate}
            </p>
          )}
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="space-y-6">
      {renderCalendarHeader()}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="resourceFilter">Tipo de Recurso</Label>
                <Select
                  value={resourceFilter}
                  onValueChange={setResourceFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os recursos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os recursos</SelectItem>
                    <SelectItem value="datashow">Data Shows</SelectItem>
                    <SelectItem value="chromebook">Chromebooks</SelectItem>
                    <SelectItem value="lab">Laboratórios</SelectItem>
                    <SelectItem value="library">Bibliotecas</SelectItem>
                    <SelectItem value="tv">TVs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="statusFilter">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="userFilter">Usuário</Label>
                <Input
                  placeholder="Filtrar por usuário..."
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Views */}
      <Card>
        <CardContent className="p-6">
          {isLoading || isLoadingAuth ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando agendamentos...</p>
              </div>
            </div>
          ) : (
            <>
              {viewMode === "week" && (
                <div className="grid grid-cols-7 sm:grid-cols-8 gap-1 sm:gap-2">
                  {/* Header com horário - escondido em mobile */}
                  <div className="hidden sm:block p-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Horário
                  </div>

                  {/* Cabeçalho dos dias */}
                  {visibleDates.map((date, index) => {
                    const allDayBookings = getBookingsForDate(date);
                    const dayUserBookings = allDayBookings;

                    return (
                      <div
                        key={index}
                        className={`p-1 sm:p-2 text-center relative ${
                          isWeekend(date)
                            ? "bg-gray-100 dark:bg-gray-800/20 opacity-60"
                            : ""
                        }`}
                      >
                        <div
                          className={`text-xs sm:text-sm font-medium ${
                            isWeekend(date)
                              ? "text-gray-400 dark:text-gray-500"
                              : "text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          {format(date, "EEE", { locale: ptBR })}
                          {isWeekend(date) && (
                            <span className="ml-1 text-xs opacity-70">•</span>
                          )}
                        </div>
                        <div
                          className={`text-sm sm:text-lg font-semibold ${
                            isSameDay(date, new Date())
                              ? "text-blue-600 dark:text-blue-400"
                              : isWeekend(date)
                              ? "text-gray-400 dark:text-gray-500"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {format(date, "d")}
                        </div>

                        {/* Indicador de agendamentos */}
                        {dayUserBookings.length > 0 && (
                          <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {dayUserBookings.length}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {timeBlocks.map((timeBlock) => (
                    <React.Fragment key={timeBlock.id}>
                      {/* Lista de horários - escondida em mobile */}
                      <div className="hidden sm:block p-2 text-sm text-gray-600 dark:text-gray-400 border-t dark:border-gray-700">
                        <div className="font-medium">{timeBlock.label}</div>
                        <div className="text-xs">
                          {timeBlock.startTime} - {timeBlock.endTime}
                        </div>
                      </div>

                      {/* Células dos agendamentos */}
                      {visibleDates.map((date, dateIndex) => {
                        const allDayBookings = getBookingsForDate(date);
                        const timeBlockBookings = allDayBookings.filter(
                          (booking) => booking.timeBlockId === timeBlock.id
                        );
                        const dayBookings = timeBlockBookings;

                        return (
                          <div
                            key={`${timeBlock.id}-${dateIndex}`}
                            className={`relative p-1 sm:p-2 border-t dark:border-gray-700 min-h-[50px] sm:min-h-[80px] transition-colors ${(() => {
                              // Verificar se a data é no passado
                              if (isPastDate(date)) {
                                return "bg-red-50 dark:bg-red-900/10 cursor-not-allowed opacity-60 text-red-400 dark:text-red-500";
                              }

                              // Verificar se é final de semana
                              if (isWeekend(date)) {
                                return "bg-gray-100 dark:bg-gray-800/30 cursor-not-allowed opacity-50 text-gray-400 dark:text-gray-500";
                              }

                              const dateStr = format(date, "yyyy-MM-dd");
                              const availableResources =
                                getAvailableResourcesForTimeSlot(
                                  timeBlock.id,
                                  dateStr
                                );

                              if (availableResources.length === 0) {
                                return "bg-red-50 cursor-not-allowed opacity-60";
                              } else if (dayBookings.length > 0) {
                                return "bg-yellow-50 cursor-pointer hover:bg-yellow-100";
                              } else {
                                return "cursor-pointer hover:bg-gray-50";
                              }
                            })()}`}
                            onClick={() => {
                              // Verificar se é final de semana
                              if (isWeekend(date)) {
                                toast({
                                  title: "Agendamento não permitido",
                                  description:
                                    "Não é possível fazer agendamentos aos sábados e domingos.",
                                  variant: "destructive",
                                });
                                return;
                              }

                              // Verificar se há recursos disponíveis para este horário
                              const dateStr = format(date, "yyyy-MM-dd");
                              const availableResources =
                                getAvailableResourcesForTimeSlot(
                                  timeBlock.id,
                                  dateStr
                                );

                              // Se não há recursos disponíveis, não permitir clique
                              if (availableResources.length === 0) {
                                toast({
                                  title: "Horário totalmente ocupado",
                                  description:
                                    "Todos os recursos estão ocupados neste horário.",
                                  variant: "destructive",
                                });
                                return;
                              }

                              openBookingModal(date, timeBlock.id);
                            }}
                          >
                            {/* Indicador de horário no mobile */}
                            <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 mb-1">
                              {timeBlock.startTime}
                            </div>

                            {/* Indicador de disponibilidade */}
                            {(() => {
                              // Se é data passada, mostrar indicador específico
                              if (isPastDate(date)) {
                                return (
                                  <div className="text-xs mb-1">
                                    <span className="text-red-500 dark:text-red-400 font-medium">
                                      Data passada
                                    </span>
                                  </div>
                                );
                              }

                              // Se é final de semana, mostrar indicador específico
                              if (isWeekend(date)) {
                                return (
                                  <div className="text-xs mb-1">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                                      Final de semana
                                    </span>
                                  </div>
                                );
                              }

                              const dateStr = format(date, "yyyy-MM-dd");
                              const availableResources =
                                getAvailableResourcesForTimeSlot(
                                  timeBlock.id,
                                  dateStr
                                );
                              const totalResources = resources.length;
                              const occupiedResources =
                                totalResources - availableResources.length;

                              return (
                                <div className="text-xs mb-1">
                                  {availableResources.length === 0 ? (
                                    <span className="text-red-600 font-medium">
                                      🔴 Totalmente ocupado
                                    </span>
                                  ) : occupiedResources > 0 ? (
                                    <span className="text-yellow-600">
                                      🟡 {availableResources.length}/
                                      {totalResources} disponível(is)
                                    </span>
                                  ) : (
                                    <span className="text-green-600">
                                      🟢 Todos disponíveis
                                    </span>
                                  )}
                                </div>
                              );
                            })()}

                            {/* Agendamentos do usuário */}
                            <div className="space-y-1">
                              {dayBookings.map((booking) => (
                                <div
                                  key={booking.id}
                                  className={`rounded-md text-xs border-l-4 cursor-pointer transition-all hover:shadow-md dark:hover:shadow-lg p-1 sm:p-2 ${
                                    booking.status === "confirmed"
                                      ? "bg-green-50 dark:bg-gray-800/60 border-green-400 dark:border-green-500 text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-gray-700/80"
                                      : booking.status === "pending"
                                      ? "bg-yellow-50 dark:bg-gray-800/60 border-yellow-400 dark:border-yellow-500 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-gray-700/80"
                                      : booking.status === "cancelled"
                                      ? "bg-red-50 dark:bg-gray-800/60 border-red-400 dark:border-red-500 text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-gray-700/80"
                                      : "bg-blue-50 dark:bg-gray-800/60 border-blue-400 dark:border-blue-500 text-blue-800 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-gray-700/80"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(booking);
                                  }}
                                >
                                  <div className="flex items-center gap-1 mb-1">
                                    <span className="font-medium truncate">
                                      {booking.resource.name}
                                    </span>
                                    {booking.isRecurring && (
                                      <Repeat className="h-3 w-3 flex-shrink-0" />
                                    )}
                                  </div>

                                  {/* Horário visível apenas no mobile */}
                                  <div className="sm:hidden flex items-center gap-1 text-xs">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {booking.timeBlock.startTime} -{" "}
                                      {booking.timeBlock.endTime}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 text-xs mt-1">
                                    <span className="truncate">
                                      {booking.purpose}
                                    </span>
                                  </div>

                                  {/* Status badge */}
                                  <div className="mt-1">
                                    <Badge
                                      variant={
                                        booking.status === "confirmed"
                                          ? "default"
                                          : booking.status === "pending"
                                          ? "secondary"
                                          : booking.status === "cancelled"
                                          ? "destructive"
                                          : "outline"
                                      }
                                      className="text-xs px-1 py-0"
                                    >
                                      {booking.status === "confirmed"
                                        ? "Confirmado"
                                        : booking.status === "pending"
                                        ? "Aguardando"
                                        : booking.status === "cancelled"
                                        ? "Cancelado"
                                        : booking.status === "completed"
                                        ? "Finalizado"
                                        : "Desconhecido"}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Indicador de disponibilidade */}
                            {dayBookings.length === 0 && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <Plus className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {viewMode === "day" && (
                <div className="space-y-4">
                  {/* Cabeçalho do dia */}
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {format(currentDate, "EEEE", { locale: ptBR })}
                    </div>
                    <div className="text-lg text-gray-600 dark:text-gray-400">
                      {format(currentDate, "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </div>
                    {isPastDate(currentDate) && (
                      <div className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
                        ✗ Data passada - Agendamentos não permitidos
                      </div>
                    )}
                    {!isPastDate(currentDate) && isWeekend(currentDate) && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                        • Final de semana - Agendamentos não permitidos
                      </div>
                    )}
                  </div>

                  {/* Lista de horários do dia */}
                  <div className="space-y-2">
                    {timeBlocks.map((timeBlock) => {
                      const dayBookings = getBookingsForDate(
                        currentDate
                      ).filter(
                        (booking) => booking.timeBlockId === timeBlock.id
                      );
                      const dateStr = format(currentDate, "yyyy-MM-dd");
                      const availableResources =
                        getAvailableResourcesForTimeSlot(timeBlock.id, dateStr);
                      const totalResources = resources.length;
                      const occupiedResources =
                        totalResources - availableResources.length;

                      return (
                        <div
                          key={timeBlock.id}
                          className={`p-4 rounded-lg border transition-all ${(() => {
                            if (isPastDate(currentDate)) {
                              return "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 cursor-not-allowed opacity-60";
                            }
                            if (isWeekend(currentDate)) {
                              return "bg-gray-100 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-50";
                            }
                            if (availableResources.length === 0) {
                              return "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 cursor-not-allowed";
                            }
                            if (dayBookings.length > 0) {
                              return "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/20";
                            }
                            return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50";
                          })()}`}
                          onClick={() => {
                            if (
                              !isPastDate(currentDate) &&
                              !isWeekend(currentDate) &&
                              availableResources.length > 0
                            ) {
                              openBookingModal(currentDate, timeBlock.id);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                <div>
                                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                                    {timeBlock.label}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {timeBlock.startTime} - {timeBlock.endTime}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Indicador de disponibilidade */}
                            <div className="flex items-center gap-2">
                              {isPastDate(currentDate) ? (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Data passada
                                </Badge>
                              ) : isWeekend(currentDate) ? (
                                <Badge variant="secondary" className="text-xs">
                                  Final de semana
                                </Badge>
                              ) : availableResources.length === 0 ? (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Totalmente ocupado
                                </Badge>
                              ) : occupiedResources > 0 ? (
                                <Badge variant="secondary" className="text-xs">
                                  {availableResources.length}/{totalResources}{" "}
                                  disponível(is)
                                </Badge>
                              ) : (
                                <Badge
                                  variant="default"
                                  className="text-xs bg-green-100 text-green-800 border-green-200"
                                >
                                  Todos disponíveis
                                </Badge>
                              )}

                              {!isPastDate(currentDate) &&
                                !isWeekend(currentDate) &&
                                availableResources.length > 0 && (
                                  <Plus className="h-4 w-4 text-gray-400" />
                                )}
                            </div>
                          </div>

                          {/* Agendamentos existentes */}
                          {dayBookings.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 border-t pt-3">
                                Agendamentos ({dayBookings.length})
                              </div>
                              <div className="grid gap-2">
                                {dayBookings.map((booking) => (
                                  <div
                                    key={booking.id}
                                    className={`p-3 rounded-md border-l-4 cursor-pointer transition-all hover:shadow-md dark:hover:shadow-lg ${
                                      booking.status === "confirmed"
                                        ? "bg-green-50 dark:bg-gray-800/60 border-green-400 dark:border-green-500 text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-gray-700/80"
                                        : booking.status === "pending"
                                        ? "bg-yellow-50 dark:bg-gray-800/60 border-yellow-400 dark:border-yellow-500 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-gray-700/80"
                                        : booking.status === "cancelled"
                                        ? "bg-red-50 dark:bg-gray-800/60 border-red-400 dark:border-red-500 text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-gray-700/80"
                                        : "bg-blue-50 dark:bg-gray-800/60 border-blue-400 dark:border-blue-500 text-blue-800 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-gray-700/80"
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditModal(booking);
                                    }}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span className="font-medium">
                                          {booking.resource.name}
                                        </span>
                                        {booking.isRecurring && (
                                          <Repeat className="h-4 w-4" />
                                        )}
                                      </div>
                                      <Badge
                                        variant={
                                          booking.status === "confirmed"
                                            ? "default"
                                            : booking.status === "pending"
                                            ? "secondary"
                                            : booking.status === "cancelled"
                                            ? "destructive"
                                            : "outline"
                                        }
                                        className="text-xs"
                                      >
                                        {booking.status === "confirmed"
                                          ? "Confirmado"
                                          : booking.status === "pending"
                                          ? "Aguardando"
                                          : booking.status === "cancelled"
                                          ? "Cancelado"
                                          : booking.status === "completed"
                                          ? "Finalizado"
                                          : "Desconhecido"}
                                      </Badge>
                                    </div>
                                    <div className="text-sm">
                                      <div className="flex items-center gap-2 mb-1">
                                        <User className="h-3 w-3" />
                                        <span>{booking.user.name}</span>
                                      </div>
                                      <div className="text-gray-600 dark:text-gray-400">
                                        {booking.purpose}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {viewMode === "month" && (
                <div className="grid grid-cols-7 gap-1">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                    (day) => (
                      <div
                        key={day}
                        className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400 border-b dark:border-gray-700"
                      >
                        {day}
                      </div>
                    )
                  )}
                  {visibleDates.map((date, index) => (
                    <div
                      key={index}
                      className={`p-2 min-h-[100px] border dark:border-gray-700 transition-colors ${
                        isPastDate(date)
                          ? "cursor-not-allowed bg-red-50 dark:bg-red-900/10 opacity-60 text-red-400 dark:text-red-500"
                          : isWeekend(date)
                          ? "cursor-not-allowed bg-gray-100 dark:bg-gray-800/20 opacity-50 text-gray-400 dark:text-gray-500"
                          : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      } ${
                        !isSameMonth(date, currentDate)
                          ? "text-gray-400 bg-gray-50"
                          : ""
                      } ${
                        isSameDay(date, new Date())
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }`}
                      onClick={() => {
                        // Não permitir clique em datas passadas ou finais de semana
                        if (isPastDate(date) || isWeekend(date)) {
                          return;
                        }
                        openBookingModal(date);
                      }}
                    >
                      <div
                        className={`text-sm font-medium mb-1 ${
                          isPastDate(date)
                            ? "text-red-400 dark:text-red-500"
                            : isWeekend(date)
                            ? "text-gray-400 dark:text-gray-500"
                            : "dark:text-gray-200"
                        }`}
                      >
                        {format(date, "d")}
                        {isPastDate(date) && (
                          <span className="ml-1 text-xs opacity-70">✗</span>
                        )}
                        {!isPastDate(date) && isWeekend(date) && (
                          <span className="ml-1 text-xs opacity-70">•</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {getBookingsForDate(date)
                          .slice(0, 3)
                          .map((booking) => (
                            <BookingComponent
                              key={booking.id}
                              booking={booking}
                              onEdit={openEditModal}
                            />
                          ))}
                        {getBookingsForDate(date).length > 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            +{getBookingsForDate(date).length - 3} mais
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Booking Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode
                ? "Editar Agendamento"
                : isTimeSlotFixed
                ? `Agendar para ${
                    timeBlocks.find((tb) => tb.id === formData.timeBlockId)
                      ?.label || "Horário"
                  } - ${format(parseISO(formData.date), "dd/MM/yyyy")}`
                : "Novo Agendamento"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {showSuggestions && renderSmartSuggestions()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resource">Recurso</Label>
                <Select
                  value={formData.resourceId}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      resourceId: value,
                      // Só limpa o horário se não estiver fixo
                      timeBlockId: isTimeSlotFixed ? prev.timeBlockId : "",
                    }));
                    if (value && formData.date) {
                      const suggestions = generateSmartSuggestions(
                        value,
                        parseISO(formData.date)
                      );
                      setSmartSuggestions(suggestions);
                      setShowSuggestions(suggestions.length > 0);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um recurso" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Quando horário está fixo (clicou em slot específico), mostrar apenas recursos disponíveis */}
                    {isTimeSlotFixed &&
                    formData.timeBlockId &&
                    formData.date ? (
                      getAvailableResourcesForTimeSlot(
                        formData.timeBlockId,
                        formData.date
                      ).length > 0 ? (
                        getAvailableResourcesForTimeSlot(
                          formData.timeBlockId,
                          formData.date
                        ).map((resource) => (
                          <SelectItem key={resource.id} value={resource.id}>
                            <div className="w-full flex items-center justify-between">
                              <span className="truncate">
                                {resource.name} - {resource.location}
                              </span>
                              <span className="text-xs px-2 py-1 rounded font-medium bg-green-100 text-green-800 border border-green-200 ml-2">
                                Disponível
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          Nenhum recurso disponível para este horário
                        </div>
                      )
                    ) : (
                      /* Modo normal - mostrar todos os recursos */
                      resources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.name} - {resource.location}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {formErrors.resourceId && (
                  <p className="text-sm text-red-600 mt-1">
                    {formErrors.resourceId}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="timeBlock">Horário</Label>
                <Select
                  value={formData.timeBlockId}
                  onValueChange={async (value) => {
                    // Verificação em tempo real antes de selecionar
                    if (formData.resourceId && formData.date) {
                      // Recarregar bookings para garantir dados atualizados
                      await fetchBookings();

                      // Recalcular horários disponíveis
                      const updatedAvailable = getAvailableTimeSlots(
                        formData.resourceId,
                        formData.date
                      );
                      setAvailableTimeSlots(updatedAvailable);

                      // Verificar se o horário ainda está disponível
                      if (!updatedAvailable.includes(value)) {
                        toast({
                          title: "Horário não disponível",
                          description:
                            "Este horário foi ocupado recentemente. Por favor, selecione outro.",
                          variant: "destructive",
                        });
                        return;
                      }
                    }

                    setFormData((prev) => ({ ...prev, timeBlockId: value }));
                  }}
                  disabled={
                    isTimeSlotFixed || !formData.resourceId || !formData.date
                  }
                >
                  <SelectTrigger>
                    {isTimeSlotFixed ? (
                      <div className="text-left">
                        {timeBlocks.find((tb) => tb.id === formData.timeBlockId)
                          ?.label || formData.timeBlockId}
                      </div>
                    ) : (
                      <SelectValue
                        placeholder={
                          !formData.resourceId
                            ? "Selecione um recurso primeiro"
                            : !formData.date
                            ? "Selecione uma data primeiro"
                            : availableTimeSlots.length === 0
                            ? "Nenhum horário disponível"
                            : "Selecione um horário"
                        }
                      />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {/* Mostra apenas horários disponíveis quando recurso e data estão selecionados */}
                    {formData.resourceId && formData.date ? (
                      availableTimeSlots.length > 0 ? (
                        timeBlocks
                          .filter((timeBlock) =>
                            availableTimeSlots.includes(timeBlock.id)
                          )
                          .map((timeBlock) => (
                            <SelectItem key={timeBlock.id} value={timeBlock.id}>
                              <div className="w-full flex items-center justify-between">
                                <span className="truncate">
                                  {timeBlock.label} ({timeBlock.startTime} -{" "}
                                  {timeBlock.endTime})
                                </span>
                                <span className="text-xs px-2 py-1 rounded font-medium bg-green-100 text-green-800 border border-green-200 ml-2">
                                  Disponível
                                </span>
                              </div>
                            </SelectItem>
                          ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          Nenhum horário disponível para esta data e recurso
                        </div>
                      )
                    ) : (
                      /* Mostra todos os horários quando recurso ou data não estão selecionados */
                      timeBlocks.map((timeBlock) => (
                        <SelectItem
                          key={timeBlock.id}
                          value={timeBlock.id}
                          disabled
                        >
                          <div className="w-full flex items-center justify-between">
                            <span className="truncate">
                              {timeBlock.label} ({timeBlock.startTime} -{" "}
                              {timeBlock.endTime})
                            </span>
                            <span className="text-xs px-2 py-1 rounded font-medium bg-gray-100 text-gray-500 border border-gray-200 ml-2">
                              Selecione recurso e data
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {formErrors.timeBlockId && (
                  <p className="text-sm text-red-600 mt-1">
                    {formErrors.timeBlockId}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    date: e.target.value,
                    timeBlockId: isTimeSlotFixed ? prev.timeBlockId : "", // Não limpa o horário se está fixo
                  }));
                }}
                min={format(new Date(), "yyyy-MM-dd")}
                disabled={isTimeSlotFixed}
              />
              {formErrors.date && (
                <p className="text-sm text-red-600 mt-1">{formErrors.date}</p>
              )}
            </div>

            <div>
              <Label htmlFor="purpose">Propósito</Label>
              <Textarea
                placeholder="Descreva o propósito do agendamento..."
                value={formData.purpose}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    purpose: e.target.value,
                  }))
                }
                rows={3}
              />
              {formErrors.purpose && (
                <p className="text-sm text-red-600 mt-1">
                  {formErrors.purpose}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isRecurring: checked as boolean,
                  }))
                }
              />
              <Label htmlFor="isRecurring" className="flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                Agendamento Recorrente
              </Label>
            </div>

            {renderRecurringOptions()}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : isEditMode
                ? "Atualizar"
                : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

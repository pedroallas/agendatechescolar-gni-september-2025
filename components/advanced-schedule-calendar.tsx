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
import { toast } from "@/hooks/use-toast";

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
        className={`p-2 rounded-md text-xs border-l-4 hover:shadow-md transition-shadow ${
          booking.status === "confirmed"
            ? "bg-green-50 border-green-400 text-green-800"
            : booking.status === "pending"
            ? "bg-yellow-50 border-yellow-400 text-yellow-800"
            : booking.status === "cancelled"
            ? "bg-red-50 border-red-400 text-red-800"
            : "bg-blue-50 border-blue-400 text-blue-800"
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
  // State Management
  const [currentDate, setCurrentDate] = useState(initialDate);
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

  // Modal States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
  const { user } = useAuth();

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
    fetchBookings();
  }, [startDate, endDate]);

  useEffect(() => {
    applyFilters();
  }, [bookings, resourceFilter, statusFilter, userFilter]);

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
        return [];
      }

      const selectedDate = parseISO(date);
      const bookingsForDate = bookings.filter(
        (booking) =>
          booking.resourceId === resourceId &&
          isSameDay(parseISO(booking.date), selectedDate) &&
          booking.status !== "cancelled"
      );

      const occupiedTimeBlocks = bookingsForDate.map(
        (booking) => booking.timeBlockId
      );

      const availableSlots = timeBlocks
        .filter((timeBlock) => !occupiedTimeBlocks.includes(timeBlock.id))
        .map((timeBlock) => timeBlock.id);

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
  }, [formData.resourceId, formData.date, getAvailableTimeSlots]);

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
      setBookings(data);
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

      // Validar se o usuário está autenticado
      if (!user?.id) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado. Faça login novamente.",
          variant: "destructive",
        });
        return;
      }

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
    return filteredBookings.filter((booking) => booking.date === dateStr);
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

  const openBookingModal = (
    date?: Date,
    timeBlockId?: string,
    resourceId?: string
  ) => {
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="resourceFilter">Tipo de Recurso</Label>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
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
        </CardContent>
      </Card>

      {/* Calendar Views */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando agendamentos...</p>
              </div>
            </div>
          ) : (
            <>
              {viewMode === "week" && (
                <div className="grid grid-cols-8 gap-2">
                  <div className="p-2 text-sm font-medium text-gray-600">
                    Horário
                  </div>
                  {visibleDates.map((date, index) => (
                    <div key={index} className="p-2 text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {format(date, "EEE", { locale: ptBR })}
                      </div>
                      <div
                        className={`text-lg font-semibold ${
                          isSameDay(date, new Date())
                            ? "text-blue-600"
                            : "text-gray-700"
                        }`}
                      >
                        {format(date, "d")}
                      </div>
                    </div>
                  ))}

                  {timeBlocks.map((timeBlock) => (
                    <React.Fragment key={timeBlock.id}>
                      <div className="p-2 text-sm text-gray-600 border-t">
                        <div className="font-medium">{timeBlock.label}</div>
                        <div className="text-xs">
                          {timeBlock.startTime} - {timeBlock.endTime}
                        </div>
                      </div>
                      {visibleDates.map((date, dateIndex) => (
                        <div
                          key={`${timeBlock.id}-${dateIndex}`}
                          className="p-2 border-t min-h-[80px] cursor-pointer hover:bg-gray-50"
                          onClick={() => openBookingModal(date, timeBlock.id)}
                        >
                          {getBookingsForDate(date)
                            .filter(
                              (booking) => booking.timeBlockId === timeBlock.id
                            )
                            .map((booking) => (
                              <BookingComponent
                                key={booking.id}
                                booking={booking}
                                onEdit={openEditModal}
                              />
                            ))}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {viewMode === "month" && (
                <div className="grid grid-cols-7 gap-1">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                    (day) => (
                      <div
                        key={day}
                        className="p-2 text-center text-sm font-medium text-gray-600 border-b"
                      >
                        {day}
                      </div>
                    )
                  )}
                  {visibleDates.map((date, index) => (
                    <div
                      key={index}
                      className={`p-2 min-h-[100px] border cursor-pointer hover:bg-gray-50 ${
                        !isSameMonth(date, currentDate)
                          ? "text-gray-400 bg-gray-50"
                          : ""
                      } ${
                        isSameDay(date, new Date())
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }`}
                      onClick={() => openBookingModal(date)}
                    >
                      <div className="text-sm font-medium mb-1">
                        {format(date, "d")}
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
                          <div className="text-xs text-gray-500">
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
              {isEditMode ? "Editar Agendamento" : "Novo Agendamento"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {renderSmartSuggestions()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resource">Recurso</Label>
                <Select
                  value={formData.resourceId}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, resourceId: value }));
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
                    {resources.map((resource) => (
                      <SelectItem key={resource.id} value={resource.id}>
                        {resource.name} - {resource.location}
                      </SelectItem>
                    ))}
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
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, timeBlockId: value }))
                  }
                  disabled={!formData.resourceId || !formData.date}
                >
                  <SelectTrigger>
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
                  </SelectTrigger>
                  <SelectContent>
                    {timeBlocks.map((timeBlock) => (
                      <SelectItem
                        key={timeBlock.id}
                        value={timeBlock.id}
                        disabled={
                          !!(
                            formData.resourceId &&
                            formData.date &&
                            !availableTimeSlots.includes(timeBlock.id)
                          )
                        }
                      >
                        <div className="w-full grid grid-cols-[1fr_80px] gap-2 items-center">
                          <span className="truncate text-left">
                            {timeBlock.label} ({timeBlock.startTime} -{" "}
                            {timeBlock.endTime})
                          </span>
                          <div className="flex justify-end">
                            {formData.resourceId && formData.date ? (
                              <span
                                className={`text-xs px-2 py-1 rounded font-medium whitespace-nowrap w-20 text-center ${
                                  availableTimeSlots.includes(timeBlock.id)
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-red-100 text-red-800 border border-red-200"
                                }`}
                              >
                                {availableTimeSlots.includes(timeBlock.id)
                                  ? "Disponível"
                                  : "Ocupado"}
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 rounded font-medium whitespace-nowrap w-20 text-center bg-gray-100 text-gray-500 border border-gray-200">
                                Selecione
                              </span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
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
                  setFormData((prev) => ({ ...prev, date: e.target.value }));
                  // Não limpar o horário automaticamente - deixar o usuário decidir
                }}
                min={format(new Date(), "yyyy-MM-dd")}
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

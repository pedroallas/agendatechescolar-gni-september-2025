"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useResources } from "@/hooks/use-resources";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Repeat,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingFormData {
  resourceId: string;
  timeBlockId: string;
  date: string;
  purpose: string;
  isRecurring: boolean;
  recurringPattern: {
    type: "daily" | "weekly" | "monthly";
    interval: number;
    endDate?: string;
    daysOfWeek?: number[];
  };
}

interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
}

interface BookingFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingCreated?: () => void;
  initialDate?: string;
}

export function BookingFormModal({
  open,
  onOpenChange,
  onBookingCreated,
  initialDate,
}: BookingFormModalProps) {
  const { user } = useAuth();
  const { resources } = useResources();
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<BookingFormData>({
    resourceId: "",
    timeBlockId: "",
    date: initialDate || format(new Date(), "yyyy-MM-dd"),
    purpose: "",
    isRecurring: false,
    recurringPattern: {
      type: "weekly",
      interval: 1,
      daysOfWeek: [],
    },
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch time blocks
  useEffect(() => {
    const fetchTimeBlocks = async () => {
      try {
        const response = await fetch("/api/time-blocks");
        if (response.ok) {
          const data = await response.json();
          setTimeBlocks(data);
        }
      } catch (error) {
        console.error("Erro ao carregar horários:", error);
      }
    };

    if (open) {
      fetchTimeBlocks();
    }
  }, [open]);

  // Check availability when resource, date changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (!formData.resourceId || !formData.date) {
        setAvailableTimeSlots([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/bookings?resourceId=${formData.resourceId}&date=${formData.date}`
        );
        if (response.ok) {
          const bookings = await response.json();
          const bookedTimeSlots = bookings.map(
            (booking: any) => booking.timeBlockId
          );
          const available = timeBlocks
            .filter((timeBlock) => !bookedTimeSlots.includes(timeBlock.id))
            .map((timeBlock) => timeBlock.id);
          setAvailableTimeSlots(available);
        }
      } catch (error) {
        console.error("Erro ao verificar disponibilidade:", error);
      }
    };

    checkAvailability();
  }, [formData.resourceId, formData.date, timeBlocks]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.resourceId) {
      errors.resourceId = "Selecione um recurso";
    }
    if (!formData.timeBlockId) {
      errors.timeBlockId = "Selecione um horário";
    }
    if (!formData.date) {
      errors.date = "Selecione uma data";
    }
    if (!formData.purpose.trim()) {
      errors.purpose = "Descreva o propósito do agendamento";
    }

    if (formData.isRecurring) {
      if (!formData.recurringPattern.endDate) {
        errors.endDate =
          "Selecione uma data de fim para agendamentos recorrentes";
      }
      if (
        formData.recurringPattern.type === "weekly" &&
        formData.recurringPattern.daysOfWeek?.length === 0
      ) {
        errors.daysOfWeek = "Selecione pelo menos um dia da semana";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const bookingData = {
        ...formData,
        userId: user?.id,
        recurringPattern: formData.isRecurring
          ? formData.recurringPattern
          : null,
      };

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        const booking = await response.json();
        toast({
          title: "Agendamento criado com sucesso!",
          description: formData.isRecurring
            ? "Seus agendamentos recorrentes foram criados."
            : "Seu agendamento foi criado e está aguardando confirmação.",
        });

        onBookingCreated?.();
        handleClose();
      } else {
        const error = await response.json();
        toast({
          title: "Erro ao criar agendamento",
          description: error.error || "Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      toast({
        title: "Erro ao criar agendamento",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      resourceId: "",
      timeBlockId: "",
      date: initialDate || format(new Date(), "yyyy-MM-dd"),
      purpose: "",
      isRecurring: false,
      recurringPattern: {
        type: "weekly",
        interval: 1,
        daysOfWeek: [],
      },
    });
    setFormErrors({});
    onOpenChange(false);
  };

  const selectedResource = resources.find((r) => r.id === formData.resourceId);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Novo Agendamento
            </Dialog.Title>
          </div>

          <div className="space-y-4">
            {/* Resource and Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resource" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Recurso
                </Label>
                <Select
                  value={formData.resourceId}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      resourceId: value,
                      timeBlockId: "",
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um recurso" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.map((resource) => (
                      <SelectItem key={resource.id} value={resource.id}>
                        <div className="flex flex-col">
                          <span>{resource.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {resource.location}
                          </span>
                        </div>
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
                <Label htmlFor="date" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Data
                </Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      date: e.target.value,
                      timeBlockId: "",
                    }));
                  }}
                  min={format(new Date(), "yyyy-MM-dd")}
                />
                {formErrors.date && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.date}</p>
                )}
              </div>
            </div>

            {/* Time Block Selection */}
            <div>
              <Label htmlFor="timeBlock" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horário
              </Label>
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
                      <div className="flex justify-between items-center w-full">
                        <span>
                          {timeBlock.label} ({timeBlock.startTime} -{" "}
                          {timeBlock.endTime})
                        </span>
                        {formData.resourceId && formData.date && (
                          <span
                            className={`text-xs px-2 py-1 rounded ml-2 ${
                              availableTimeSlots.includes(timeBlock.id)
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {availableTimeSlots.includes(timeBlock.id)
                              ? "Disponível"
                              : "Ocupado"}
                          </span>
                        )}
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

            {/* Purpose */}
            <div>
              <Label htmlFor="purpose">Propósito do Agendamento</Label>
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

            {/* Recurring Options */}
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

            {formData.isRecurring && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Recorrência</Label>
                    <Select
                      value={formData.recurringPattern.type}
                      onValueChange={(value: "daily" | "weekly" | "monthly") =>
                        setFormData((prev) => ({
                          ...prev,
                          recurringPattern: {
                            ...prev.recurringPattern,
                            type: value,
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Data de Fim</Label>
                    <Input
                      type="date"
                      value={formData.recurringPattern.endDate || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          recurringPattern: {
                            ...prev.recurringPattern,
                            endDate: e.target.value,
                          },
                        }))
                      }
                      min={formData.date}
                    />
                    {formErrors.endDate && (
                      <p className="text-sm text-red-600 mt-1">
                        {formErrors.endDate}
                      </p>
                    )}
                  </div>
                </div>

                {formData.recurringPattern.type === "weekly" && (
                  <div>
                    <Label>Dias da Semana</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                        (day, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`day-${index}`}
                              checked={
                                formData.recurringPattern.daysOfWeek?.includes(
                                  index
                                ) || false
                              }
                              onCheckedChange={(checked) => {
                                const currentDays =
                                  formData.recurringPattern.daysOfWeek || [];
                                const newDays = checked
                                  ? [...currentDays, index]
                                  : currentDays.filter((d) => d !== index);
                                setFormData((prev) => ({
                                  ...prev,
                                  recurringPattern: {
                                    ...prev.recurringPattern,
                                    daysOfWeek: newDays,
                                  },
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
                    {formErrors.daysOfWeek && (
                      <p className="text-sm text-red-600 mt-1">
                        {formErrors.daysOfWeek}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Resource Info */}
            {selectedResource && (
              <div className="p-4 border rounded-lg bg-blue-50">
                <h4 className="font-medium mb-2">Informações do Recurso</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Nome:</strong> {selectedResource.name}
                  </p>
                  <p>
                    <strong>Local:</strong> {selectedResource.location}
                  </p>
                  <p>
                    <strong>Tipo:</strong> {selectedResource.type}
                  </p>
                  {selectedResource.description && (
                    <p>
                      <strong>Descrição:</strong> {selectedResource.description}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar Agendamento"}
            </Button>
          </div>

          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

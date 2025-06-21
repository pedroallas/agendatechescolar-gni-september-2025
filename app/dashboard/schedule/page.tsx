"use client";

import { useState } from "react";
import { AdvancedScheduleCalendar } from "@/components/advanced-schedule-calendar";
import { toast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  resourceId: string;
  userId: string;
  timeBlockId: string;
  date: string;
  purpose: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
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

export default function SchedulePage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleBookingCreate = (booking: Booking) => {
    console.log("✅ Novo agendamento criado:", booking);
    toast({
      title: "Sucesso",
      description: "Agendamento criado com sucesso!",
    });
  };

  const handleBookingUpdate = (booking: Booking) => {
    console.log("✅ Agendamento atualizado:", booking);
    toast({
      title: "Sucesso",
      description: "Agendamento atualizado com sucesso!",
    });
  };

  const handleBookingDelete = (bookingId: string) => {
    console.log("✅ Agendamento cancelado:", bookingId);
    toast({
      title: "Sucesso",
      description: "Agendamento cancelado com sucesso!",
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando agenda...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Sistema de Agendamento
        </h2>
        <p className="text-muted-foreground">
          Gerencie agendamentos de recursos escolares de forma inteligente
        </p>
      </div>

      <div className="w-full">
        <AdvancedScheduleCalendar
          onBookingCreate={handleBookingCreate}
          onBookingUpdate={handleBookingUpdate}
          onBookingDelete={handleBookingDelete}
        />
      </div>
    </div>
  );
}

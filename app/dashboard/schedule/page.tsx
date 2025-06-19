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
  const handleBookingCreate = (booking: Booking) => {
    // Aqui você pode adicionar lógicas extras como:
    // - Enviar notificações
    // - Log de auditoria
    // - Análise de dados
    console.log("Novo agendamento criado:", booking);
  };

  const handleBookingUpdate = (booking: Booking) => {
    console.log("Agendamento atualizado:", booking);
  };

  const handleBookingDelete = (bookingId: string) => {
    console.log("Agendamento cancelado:", bookingId);
  };

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

      <AdvancedScheduleCalendar
        onBookingCreate={handleBookingCreate}
        onBookingUpdate={handleBookingUpdate}
        onBookingDelete={handleBookingDelete}
      />
    </div>
  );
}

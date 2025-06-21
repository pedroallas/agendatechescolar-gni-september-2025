"use client";

import { useState, useEffect } from "react";

export type Booking = {
  id: string;
  resourceId: string;
  resource: {
    id: string;
    name: string;
    type: string;
    location: string;
  };
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  timeBlockId: string;
  timeBlock: {
    id: string;
    startTime: string;
    endTime: string;
    label: string;
  };
  date: string;
  purpose: string;
  status: string;
};

export function useBookings(userId?: string, status?: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let url = "/api/bookings";
      const params = new URLSearchParams();

      if (userId) {
        params.append("userId", userId);
      }

      if (status) {
        params.append("status", status);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Falha ao carregar agendamentos");
      }

      const data = await res.json();
      setBookings(data);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      setError(
        "Não foi possível carregar os agendamentos. Tente novamente mais tarde."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [userId, status]);

  const refreshBookings = () => {
    fetchBookings();
  };

  return { bookings, isLoading, error, refreshBookings };
}

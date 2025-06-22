"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";

interface Resource {
  id: string;
  name: string;
  type: string;
  category: string;
  location: string;
  capacity?: number;
  status: string;
}

interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
  shift: string;
}

interface Booking {
  id: string;
  resource: Resource;
  timeBlock: TimeBlock;
  date: string;
  purpose: string;
  status: string;
}

export function CalendarPreview() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Gerar próximos 7 dias
  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const [weekDays] = useState(getNext7Days());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Try to fetch real data, but fallback to mock data if it fails
      try {
        const [resourcesRes, bookingsRes, timeBlocksRes] = await Promise.all([
          fetch("/api/resources").catch(() => null),
          fetch("/api/bookings").catch(() => null),
          fetch("/api/time-blocks").catch(() => null),
        ]);

        // If all requests succeeded, use real data
        if (resourcesRes?.ok && bookingsRes?.ok && timeBlocksRes?.ok) {
          const resourcesData = await resourcesRes.json();
          const bookingsData = await bookingsRes.json();
          const timeBlocksData = await timeBlocksRes.json();

          setResources(Array.isArray(resourcesData) ? resourcesData : []);
          setBookings(Array.isArray(bookingsData) ? bookingsData : []);
          setTimeBlocks(Array.isArray(timeBlocksData) ? timeBlocksData : []);
          return;
        }
      } catch (apiError) {
        console.log("APIs não disponíveis, usando dados de demonstração");
      }

      // Fallback to mock data for preview
      setResources([
        {
          id: "1",
          name: "Datashow Sala 101",
          type: "equipment",
          category: "datashow",
          location: "Sala 101",
          capacity: 1,
          status: "available",
        },
        {
          id: "2",
          name: "Laboratório de Informática",
          type: "room",
          category: "lab",
          location: "Bloco B",
          capacity: 30,
          status: "available",
        },
        {
          id: "3",
          name: "Chromebook - Turma A",
          type: "equipment",
          category: "chromebook",
          location: "Biblioteca",
          capacity: 15,
          status: "available",
        },
      ]);

      setTimeBlocks([
        {
          id: "1",
          startTime: "07:30",
          endTime: "08:20",
          label: "1º Horário",
          shift: "morning",
        },
        {
          id: "2",
          startTime: "08:20",
          endTime: "09:10",
          label: "2º Horário",
          shift: "morning",
        },
        {
          id: "3",
          startTime: "09:30",
          endTime: "10:20",
          label: "3º Horário",
          shift: "morning",
        },
      ]);

      setBookings([
        {
          id: "1",
          resource: {
            id: "1",
            name: "Datashow Sala 101",
            type: "equipment",
            category: "datashow",
            location: "Sala 101",
            status: "available",
          },
          timeBlock: {
            id: "1",
            startTime: "07:30",
            endTime: "08:20",
            label: "1º Horário",
            shift: "morning",
          },
          date: new Date().toISOString(),
          purpose: "Aula de História",
          status: "confirmed",
        },
      ]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      // Set empty arrays on error
      setResources([]);
      setBookings([]);
      setTimeBlocks([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getAvailableResources = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const dayBookings = bookings.filter(
      (booking) => booking.date.split("T")[0] === dateStr
    );

    return resources
      .filter((resource) => resource.status === "available")
      .map((resource) => {
        const resourceBookings = dayBookings.filter(
          (booking) => booking.resource.id === resource.id
        );
        const availableSlots = timeBlocks.length - resourceBookings.length;
        return {
          ...resource,
          availableSlots,
          totalSlots: timeBlocks.length,
          bookings: resourceBookings,
        };
      })
      .filter((resource) => resource.availableSlots > 0);
  };

  const getResourceIcon = (category: string) => {
    switch (category) {
      case "datashow":
        return "📽️";
      case "tv":
        return "📺";
      case "chromebook":
        return "💻";
      case "lab":
        return "🔬";
      case "library":
        return "📚";
      default:
        return "🏢";
    }
  };

  const selectedDateResources = getAvailableResources(selectedDate);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-background to-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Recursos Disponíveis</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Veja em tempo real quais recursos estão disponíveis para
              agendamento
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-8">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-20 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardContent className="p-8">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-32 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-background to-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Calendar className="h-4 w-4" />
            Preview do Sistema
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Recursos Disponíveis{" "}
            <span className="text-primary">em Tempo Real</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Veja como nosso sistema mostra a disponibilidade dos recursos da sua
            escola. Faça login para agendar!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Calendário de Dias */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Próximos 7 Dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-6">
                  {weekDays.map((date, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDate(date)}
                      className={`p-2 sm:p-3 rounded-xl text-center transition-all ${
                        selectedDate.toDateString() === date.toDateString()
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "bg-muted hover:bg-muted/80"
                      } ${isToday(date) ? "ring-2 ring-orange-400" : ""}`}
                    >
                      <div className="text-xs font-medium">
                        {formatDate(date).split(",")[0]}
                      </div>
                      <div className="text-sm sm:text-lg font-bold">
                        {date.getDate()}
                      </div>
                      {isToday(date) && (
                        <div className="text-xs text-orange-400 font-medium">
                          Hoje
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    {selectedDate.toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </h4>

                  {selectedDateResources.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum recurso disponível nesta data</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {selectedDateResources.slice(0, 4).map((resource) => (
                        <motion.div
                          key={resource.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-muted/50 rounded-lg border hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="text-2xl flex-shrink-0">
                              {getResourceIcon(resource.category)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">
                                {resource.name}
                              </div>
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">
                                    {resource.location}
                                  </span>
                                </div>
                                {resource.capacity && (
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3 flex-shrink-0" />
                                    <span>{resource.capacity}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 sm:text-right">
                            <Badge
                              variant="secondary"
                              className="whitespace-nowrap"
                            >
                              {resource.availableSlots}/{resource.totalSlots}{" "}
                              livres
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                              <Clock className="h-3 w-3" />
                              Horários disponíveis
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo de Hoje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-9 py-6 sm:py-9">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Recursos Disponíveis
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {getAvailableResources(new Date()).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total de Recursos
                    </span>
                    <span className="text-2xl font-bold">
                      {resources.filter((r) => r.status === "available").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Agendamentos Hoje
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {
                        bookings.filter(
                          (b) =>
                            b.date.split("T")[0] ===
                            new Date().toISOString().split("T")[0]
                        ).length
                      }
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Status dos Recursos
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-xs text-muted-foreground">
                          Disponíveis
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        {
                          resources.filter((r) => r.status === "available")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                        <span className="text-xs text-muted-foreground">
                          Em manutenção
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        {
                          resources.filter((r) => r.status === "maintenance")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <span className="text-xs text-muted-foreground">
                          Em uso agora
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        {Math.min(2, bookings.length)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Ocupação da Semana
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Taxa Média
                      </span>
                      <span className="text-sm font-bold text-purple-600">
                        73%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{ width: "73%" }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Baixa</span>
                      <span>Alta</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

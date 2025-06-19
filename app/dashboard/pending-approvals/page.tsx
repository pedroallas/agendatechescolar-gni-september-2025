"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  MapPin,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

interface PendingBooking {
  id: string;
  date: string;
  purpose: string;
  status: string;
  resource: {
    name: string;
    location: string;
    requiresApproval: boolean;
  };
  timeBlock: {
    label: string;
    startTime: string;
    endTime: string;
  };
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export default function PendingApprovalsPage() {
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    try {
      const response = await fetch("/api/bookings?status=pending");
      if (response.ok) {
        const bookings = await response.json();
        setPendingBookings(bookings);
      }
    } catch (error) {
      console.error("Erro ao buscar agendamentos pendentes:", error);
      toast.error("Erro ao carregar agendamentos pendentes");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (bookingId: string, approve: boolean) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: approve ? "confirmed" : "cancelled",
        }),
      });

      if (response.ok) {
        toast.success(
          approve ? "Agendamento aprovado!" : "Agendamento rejeitado!"
        );
        fetchPendingBookings(); // Recarregar lista
      } else {
        throw new Error("Erro na resposta do servidor");
      }
    } catch (error) {
      console.error("Erro ao processar aprovação:", error);
      toast.error("Erro ao processar aprovação");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Carregando agendamentos pendentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Aprovações Pendentes</h1>
        <p className="text-muted-foreground">
          Gerencie agendamentos que precisam de aprovação
        </p>
      </div>

      {pendingBookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum agendamento pendente!
            </h3>
            <p className="text-muted-foreground text-center">
              Todos os agendamentos que requerem aprovação foram processados.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingBookings.map((booking) => (
            <Card key={booking.id} className="border-orange-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      {booking.resource.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(booking.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {booking.timeBlock.label} ({booking.timeBlock.startTime}{" "}
                        - {booking.timeBlock.endTime})
                      </span>
                    </CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-800"
                  >
                    Pendente
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Finalidade:</h4>
                    <p className="text-sm text-muted-foreground">
                      {booking.purpose}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div>
                        <p className="font-medium">{booking.user.name}</p>
                        <p className="text-muted-foreground">
                          {booking.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <p>{booking.resource.location}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => handleApproval(booking.id, true)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button
                      onClick={() => handleApproval(booking.id, false)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

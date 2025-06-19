"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, X, Loader2 } from "lucide-react"
import { useBookings } from "@/hooks/use-bookings"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRouter } from "next/navigation"

interface BookingsListProps {
  status: "upcoming" | "past" | "pending"
}

export function BookingsList({ status }: BookingsListProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const statusMap = {
    upcoming: "confirmed",
    past: "completed",
    pending: "pending",
  }

  const { bookings, isLoading, error } = useBookings(user?.id, statusMap[status])

  const handleCancelBooking = async (id: string) => {
    try {
      setIsCancelling(true)
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: "PATCH",
      })

      if (!res.ok) {
        throw new Error("Falha ao cancelar agendamento")
      }

      // Redirecionar para atualizar a lista
      router.refresh()
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error)
    } finally {
      setIsCancelling(false)
      setCancelBookingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/15 text-destructive p-4 rounded-md">
        <p>{error}</p>
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">Nenhum agendamento encontrado.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{booking.resource.name}</CardTitle>
                <Badge
                  variant={
                    booking.status === "confirmed"
                      ? "default"
                      : booking.status === "pending"
                        ? "outline"
                        : booking.status === "completed"
                          ? "secondary"
                          : "destructive"
                  }
                >
                  {booking.status === "confirmed"
                    ? "Confirmado"
                    : booking.status === "pending"
                      ? "Pendente"
                      : booking.status === "completed"
                        ? "Concluído"
                        : "Cancelado"}
                </Badge>
              </div>
              <CardDescription>{booking.purpose}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid gap-2">
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(booking.date), "dd/MM/yyyy", { locale: ptBR })}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    {booking.timeBlock.startTime} - {booking.timeBlock.endTime} ({booking.timeBlock.label})
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{booking.resource.location}</span>
                </div>
              </div>
            </CardContent>
            {status === "upcoming" && (
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full text-destructive"
                  onClick={() => setCancelBookingId(booking.id)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar Agendamento
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      <AlertDialog open={!!cancelBookingId} onOpenChange={(open) => !open && setCancelBookingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de cancelamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, manter agendamento</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelBookingId && handleCancelBooking(cancelBookingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Sim, cancelar agendamento"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

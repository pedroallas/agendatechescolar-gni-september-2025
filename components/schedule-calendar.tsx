"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useTimeBlocks } from "@/hooks/use-time-blocks"
import { useResources } from "@/hooks/use-resources"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ScheduleCalendarProps {
  date?: Date
  resourceType?: string
}

export function ScheduleCalendar({ date, resourceType = "all" }: ScheduleCalendarProps) {
  const [selectedTimeBlock, setSelectedTimeBlock] = useState<string | null>(null)
  const [selectedResource, setSelectedResource] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [purpose, setPurpose] = useState("")
  const [bookings, setBookings] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { timeBlocks, isLoading: isLoadingTimeBlocks } = useTimeBlocks()
  const { resources, isLoading: isLoadingResources } = useResources(resourceType !== "all" ? resourceType : undefined)
  const { user } = useAuth()
  const router = useRouter()

  const dateString = date ? date.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`/api/bookings/date?date=${dateString}`)
        if (!res.ok) {
          throw new Error("Falha ao carregar agendamentos")
        }
        const data = await res.json()
        setBookings(data)
      } catch (error) {
        console.error("Erro ao carregar agendamentos:", error)
      }
    }

    if (date) {
      fetchBookings()
    }
  }, [date, dateString])

  const isBooked = (resourceId: string, timeBlockId: string) => {
    return bookings.some(
      (booking) =>
        booking.resourceId === resourceId &&
        booking.timeBlockId === timeBlockId &&
        booking.status !== "cancelled" &&
        new Date(booking.date).toISOString().split("T")[0] === dateString,
    )
  }

  const handleCellClick = (resourceId: string, timeBlockId: string) => {
    if (!isBooked(resourceId, timeBlockId)) {
      setSelectedResource(resourceId)
      setSelectedTimeBlock(timeBlockId)
      setOpen(true)
      setError(null)
      setSuccess(null)
    }
  }

  const handleBooking = async () => {
    if (!user || !selectedResource || !selectedTimeBlock || !purpose) {
      setError("Todos os campos são obrigatórios")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resourceId: selectedResource,
          userId: user.id,
          timeBlockId: selectedTimeBlock,
          date: dateString,
          purpose,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Falha ao criar agendamento")
      }

      setSuccess("Agendamento criado com sucesso!")
      setPurpose("")

      // Atualizar lista de agendamentos
      const bookingsRes = await fetch(`/api/bookings/date?date=${dateString}`)
      const bookingsData = await bookingsRes.json()
      setBookings(bookingsData)

      // Fechar o modal após 2 segundos
      setTimeout(() => {
        setOpen(false)
        setSuccess(null)
      }, 2000)
    } catch (error: any) {
      console.error("Erro ao criar agendamento:", error)
      setError(error.message || "Ocorreu um erro ao criar o agendamento")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingTimeBlocks || isLoadingResources) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const filteredResources =
    resourceType === "all" ? resources : resources.filter((resource) => resource.category === resourceType)

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-muted">Horário</th>
              {filteredResources.map((resource) => (
                <th key={resource.id} className="border p-2 bg-muted">
                  {resource.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeBlocks.map((timeBlock) => (
              <tr key={timeBlock.id}>
                <td className="border p-2 font-medium">
                  {timeBlock.startTime} - {timeBlock.endTime}
                  <div className="text-xs text-muted-foreground">{timeBlock.label}</div>
                </td>
                {filteredResources.map((resource) => {
                  const booked = isBooked(resource.id, timeBlock.id)
                  const isAvailable = resource.status === "available" && !booked
                  return (
                    <td
                      key={`${resource.id}-${timeBlock.id}`}
                      className={`border p-2 text-center ${
                        isAvailable
                          ? "bg-green-100 cursor-pointer hover:bg-green-200"
                          : booked
                            ? "bg-red-100 cursor-not-allowed"
                            : "bg-gray-100 cursor-not-allowed"
                      }`}
                      onClick={() => isAvailable && handleCellClick(resource.id, timeBlock.id)}
                      title={
                        isAvailable
                          ? "Clique para agendar"
                          : booked
                            ? "Já agendado"
                            : resource.status === "maintenance"
                              ? "Em manutenção"
                              : "Indisponível"
                      }
                    >
                      {isAvailable
                        ? "Disponível"
                        : booked
                          ? "Ocupado"
                          : resource.status === "maintenance"
                            ? "Manutenção"
                            : "Indisponível"}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
            <DialogDescription>Preencha os detalhes para agendar o recurso.</DialogDescription>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="resource">Recurso</Label>
              <Input
                id="resource"
                value={resources.find((r) => r.id === selectedResource)?.name || ""}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                value={
                  timeBlocks.find((t) => t.id === selectedTimeBlock)
                    ? `${timeBlocks.find((t) => t.id === selectedTimeBlock)?.startTime} - ${
                        timeBlocks.find((t) => t.id === selectedTimeBlock)?.endTime
                      } (${timeBlocks.find((t) => t.id === selectedTimeBlock)?.label})`
                    : ""
                }
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" value={new Date(dateString).toLocaleDateString("pt-BR")} readOnly className="bg-muted" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="purpose">Propósito do Uso</Label>
              <Textarea
                id="purpose"
                placeholder="Descreva o propósito do uso deste recurso"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className={!purpose ? "border-destructive" : ""}
              />
              {!purpose && <p className="text-xs text-destructive">O propósito é obrigatório</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleBooking} disabled={isSubmitting || !purpose}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                "Confirmar Agendamento"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

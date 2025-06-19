"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookingsList } from "@/components/bookings-list"

export default function MyBookingsPage() {
  const [status, setStatus] = useState("upcoming")

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Meus Agendamentos</h2>
        <Button>Novo Agendamento</Button>
      </div>
      <Tabs defaultValue="upcoming" className="space-y-4" onValueChange={setStatus}>
        <TabsList>
          <TabsTrigger value="upcoming">Próximos</TabsTrigger>
          <TabsTrigger value="past">Passados</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4">
          <BookingsList status="upcoming" />
        </TabsContent>
        <TabsContent value="past" className="space-y-4">
          <BookingsList status="past" />
        </TabsContent>
        <TabsContent value="pending" className="space-y-4">
          <BookingsList status="pending" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

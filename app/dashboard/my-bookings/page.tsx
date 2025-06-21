"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingsList } from "@/components/bookings-list";
import { BookingFormModal } from "@/components/booking-form-modal";
import { Plus } from "lucide-react";

export default function MyBookingsPage() {
  const [status, setStatus] = useState("upcoming");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNewBooking = () => {
    setIsBookingModalOpen(true);
  };

  const handleBookingCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex-1 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Meus Agendamentos
        </h2>
        <Button className="w-full sm:w-auto" onClick={handleNewBooking}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>
      <Tabs
        defaultValue="upcoming"
        className="space-y-4"
        onValueChange={setStatus}
      >
        <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:grid-cols-none sm:flex">
          <TabsTrigger value="upcoming" className="text-xs sm:text-sm">
            Próximos
          </TabsTrigger>
          <TabsTrigger value="past" className="text-xs sm:text-sm">
            Passados
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs sm:text-sm">
            Pendentes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4">
          <BookingsList status="upcoming" key={`upcoming-${refreshKey}`} />
        </TabsContent>
        <TabsContent value="past" className="space-y-4">
          <BookingsList status="past" key={`past-${refreshKey}`} />
        </TabsContent>
        <TabsContent value="pending" className="space-y-4">
          <BookingsList status="pending" key={`pending-${refreshKey}`} />
        </TabsContent>
      </Tabs>

      <BookingFormModal
        open={isBookingModalOpen}
        onOpenChange={setIsBookingModalOpen}
        onBookingCreated={handleBookingCreated}
      />
    </div>
  );
}

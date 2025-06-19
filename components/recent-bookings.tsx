import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Dados de exemplo
const bookings = [
  {
    id: "1",
    resource: "Data Show",
    user: {
      name: "Maria Santos",
      email: "maria.santos@escola.edu.br",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    date: "20/05/2025",
    time: "08:20 - 09:10",
    status: "confirmed",
  },
  {
    id: "2",
    resource: "Laboratório de Informática",
    user: {
      name: "Carlos Oliveira",
      email: "carlos.oliveira@escola.edu.br",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    date: "20/05/2025",
    time: "09:30 - 11:10",
    status: "confirmed",
  },
  {
    id: "3",
    resource: "Chromebooks (15 unidades)",
    user: {
      name: "Ana Silva",
      email: "ana.silva@escola.edu.br",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    date: "20/05/2025",
    time: "13:20 - 15:00",
    status: "pending",
  },
  {
    id: "4",
    resource: "Biblioteca",
    user: {
      name: "Pedro Souza",
      email: "pedro.souza@escola.edu.br",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    date: "21/05/2025",
    time: "07:30 - 09:10",
    status: "confirmed",
  },
  {
    id: "5",
    resource: "Caixa de Som",
    user: {
      name: "Lucia Ferreira",
      email: "lucia.ferreira@escola.edu.br",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    date: "21/05/2025",
    time: "09:30 - 10:20",
    status: "pending",
  },
]

export function RecentBookings() {
  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={booking.user.avatar || "/placeholder.svg"} alt={booking.user.name} />
              <AvatarFallback>{booking.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">{booking.resource}</p>
              <p className="text-sm text-muted-foreground">
                {booking.date} • {booking.time}
              </p>
            </div>
          </div>
          <Badge variant={booking.status === "confirmed" ? "default" : "outline"}>
            {booking.status === "confirmed" ? "Confirmado" : "Pendente"}
          </Badge>
        </div>
      ))}
    </div>
  )
}

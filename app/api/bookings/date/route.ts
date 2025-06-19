import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")

    if (!dateParam) {
      return NextResponse.json({ error: "Data não fornecida" }, { status: 400 })
    }

    // Cria um objeto Date a partir da string de data
    const date = new Date(dateParam)

    // Verifica se a data é válida
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Data inválida" }, { status: 400 })
    }

    // Define o início e o fim do dia
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        resource: {
          select: {
            id: true,
            name: true,
            type: true,
            location: true,
          },
        },
        timeBlock: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        timeBlock: {
          startTime: "asc",
        },
      },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Erro ao buscar agendamentos por data:", error)
    return NextResponse.json({ error: "Ocorreu um erro ao buscar os agendamentos." }, { status: 500 })
  }
}

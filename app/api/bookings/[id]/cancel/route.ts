import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar se o agendamento existe
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o agendamento já foi cancelado
    if (booking.status === "cancelled") {
      return NextResponse.json(
        { error: "Este agendamento já foi cancelado" },
        { status: 400 }
      );
    }

    // Cancelar o agendamento
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: "cancelled",
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao cancelar o agendamento" },
      { status: 500 }
    );
  }
}

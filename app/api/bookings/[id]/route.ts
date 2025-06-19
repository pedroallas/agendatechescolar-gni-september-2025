import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/bookings/[id] - Get booking by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        resource: true,
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
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Agendamento não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao buscar o agendamento." },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[id] - Update booking
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { resourceId, timeBlockId, date, purpose, status } =
      await request.json();

    // Verificar se o agendamento existe
    const existingBooking = await prisma.booking.findUnique({
      where: { id: params.id },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    // Verificar conflitos se data, horário ou recurso foram alterados
    if (
      resourceId !== existingBooking.resourceId ||
      timeBlockId !== existingBooking.timeBlockId ||
      new Date(date).getTime() !== existingBooking.date.getTime()
    ) {
      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          resourceId,
          timeBlockId,
          date: new Date(date),
          NOT: {
            OR: [{ id: params.id }, { status: "cancelled" }],
          },
        },
      });

      if (conflictingBooking) {
        return NextResponse.json(
          { error: "Este recurso já está agendado para esta data e horário." },
          { status: 409 }
        );
      }
    }

    // Atualizar agendamento
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        resourceId,
        timeBlockId,
        date: new Date(date),
        purpose,
        status: status || existingBooking.status,
        updatedAt: new Date(),
      },
      include: {
        resource: true,
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
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id] - Cancel booking
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se o agendamento existe
    const existingBooking = await prisma.booking.findUnique({
      where: { id: params.id },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Agendamento não encontrado." },
        { status: 404 }
      );
    }

    // Deletar o agendamento
    await prisma.booking.delete({
      where: { id: params.id },
    });

    console.log(`🗑️ Booking deleted: ${params.id}`);

    return NextResponse.json({ message: "Agendamento deletado com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar agendamento:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao deletar o agendamento." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, purpose } = body;

    // Validar status
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
    }

    // Verificar se o agendamento existe
    const existingBooking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        resource: true,
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
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Agendamento não encontrado." },
        { status: 404 }
      );
    }

    // Atualizar o agendamento
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(purpose && { purpose }),
        updatedAt: new Date(),
      },
      include: {
        resource: true,
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
    });

    console.log(
      `📝 Booking updated: ${updatedBooking.id} - Status: ${updatedBooking.status}`
    );

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao atualizar o agendamento." },
      { status: 500 }
    );
  }
}

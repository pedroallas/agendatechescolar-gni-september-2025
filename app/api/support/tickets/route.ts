import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Get user's tickets
    const tickets = await prisma.supportTicket.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        resource: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the response
    const formattedTickets = tickets.map((ticket) => ({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      resourceId: ticket.resourceId,
      resourceName: ticket.resource?.name,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedTickets);
  } catch (error) {
    console.error("Erro ao buscar tickets:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, priority, resourceId } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: "Título e descrição são obrigatórios" },
        { status: 400 }
      );
    }

    // Validate priority
    if (!["low", "medium", "high", "urgent"].includes(priority)) {
      return NextResponse.json(
        { error: "Prioridade inválida" },
        { status: 400 }
      );
    }

    // Create the ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        title,
        description,
        priority,
        status: "open",
        userId: session.user.id,
        resourceId: resourceId || null,
      },
      include: {
        resource: {
          select: {
            name: true,
          },
        },
      },
    });

    // Format the response
    const formattedTicket = {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      resourceId: ticket.resourceId,
      resourceName: ticket.resource?.name,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
    };

    return NextResponse.json(formattedTicket, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar ticket:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

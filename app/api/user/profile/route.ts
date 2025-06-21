import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validação
const updateProfileSchema = z.object({
  name: z.string().min(3).optional(),
  role: z
    .enum(["professor", "coordenador", "diretor", "funcionario"])
    .optional(),
  image: z.string().optional(), // Removido .url() para aceitar data URLs e paths
  notifications: z
    .object({
      email: z.boolean(),
      push: z.boolean(),
      bookingReminders: z.boolean(),
      systemUpdates: z.boolean(),
    })
    .optional(),
});

// GET - Obter perfil do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Buscar estatísticas de agendamentos
    const bookingStats = await prisma.booking.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: { status: true },
    });

    const stats = {
      totalBookings: user._count.bookings,
      confirmedBookings:
        bookingStats.find((s) => s.status === "confirmed")?._count.status || 0,
      cancelledBookings:
        bookingStats.find((s) => s.status === "cancelled")?._count.status || 0,
      joinDate: user.createdAt.toISOString(),
      lastActivity: user.updatedAt.toISOString(),
    };

    // Preferências padrão se não existirem
    const defaultPreferences = {
      theme: "system",
      language: "pt-BR",
      timezone: "America/Sao_Paulo",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24h",
      notifications: {
        email: true,
        push: true,
        sms: false,
        booking: true,
        reminders: true,
        updates: false,
      },
      privacy: {
        showProfile: true,
        showBookings: false,
        showActivity: true,
      },
      booking: {
        autoConfirm: false,
        defaultDuration: 60,
        reminderTime: 30,
        maxAdvanceDays: 30,
      },
    };

    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: null, // Campo ainda não disponível
      bio: null, // Campo ainda não disponível
      location: null, // Campo ainda não disponível
      role: user.role,
      avatar: user.image, // Usando image como avatar
      preferences: defaultPreferences, // Usando preferências padrão
      stats,
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar perfil do usuário
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.role && { role: validatedData.role }),
        ...(validatedData.image !== undefined && {
          image: validatedData.image,
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
    });

    // TODO: Salvar preferências de notificação em uma tabela separada

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar perfil" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, image } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name || user.name,
        ...(image !== undefined && { image }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

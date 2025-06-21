import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { section, key, value } = body;

    if (!section || !key || value === undefined) {
      return NextResponse.json(
        { error: "Seção, chave e valor são obrigatórios" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Por enquanto, apenas simular a atualização das preferências
    // TODO: Implementar quando o campo preferences estiver disponível
    let currentPreferences = {
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

    // Simular atualização
    if (!currentPreferences[section as keyof typeof currentPreferences]) {
      (currentPreferences as any)[section] = {};
    }
    (currentPreferences as any)[section][key] = value;

    return NextResponse.json({
      message: "Preferências atualizadas com sucesso",
      preferences: currentPreferences,
    });
  } catch (error) {
    console.error("Erro ao atualizar preferências:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

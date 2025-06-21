import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema para atualizar notificação individual
const updateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
});

// GET - Buscar notificação específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: id,
        userId: user.id as string, // Só pode ver suas próprias notificações
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notificação não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Erro ao buscar notificação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar notificação (marcar como lida/não lida)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const data = updateNotificationSchema.parse(body);

    // Verificar se a notificação existe e pertence ao usuário
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: id,
        userId: user.id as string,
      },
    });

    if (!existingNotification) {
      return NextResponse.json(
        { error: "Notificação não encontrada" },
        { status: 404 }
      );
    }

    // Atualizar notificação
    const updateData: any = {};

    if (data.isRead !== undefined) {
      updateData.isRead = data.isRead;
      updateData.readAt = data.isRead ? new Date() : null;
    }

    const notification = await prisma.notification.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json(notification);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar notificação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Remover notificação específica
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se a notificação existe e pertence ao usuário
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: id,
        userId: user.id as string,
      },
    });

    if (!existingNotification) {
      return NextResponse.json(
        { error: "Notificação não encontrada" },
        { status: 404 }
      );
    }

    // Remover notificação
    await prisma.notification.delete({
      where: { id: id },
    });

    return NextResponse.json({
      message: "Notificação removida com sucesso",
      id: id,
    });
  } catch (error) {
    console.error("Erro ao remover notificação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

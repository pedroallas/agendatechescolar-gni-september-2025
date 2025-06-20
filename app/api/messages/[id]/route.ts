import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema para responder mensagem
const replyMessageSchema = z.object({
  content: z.string().min(1, "Conteúdo é obrigatório"),
  attachments: z.array(z.string()).optional(),
});

// Schema para atualizar mensagem
const updateMessageSchema = z.object({
  isRead: z.boolean().optional(),
  isStarred: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

// GET - Buscar mensagem específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: messageId } = await params;

    // Buscar mensagem
    const rawMessage = await prisma.internalMessage.findFirst({
      where: {
        id: messageId,
        OR: [
          { senderId: user.id as string },
          { recipientId: user.id as string },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
          },
        },
        replies: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!rawMessage) {
      return NextResponse.json(
        { error: "Mensagem não encontrada" },
        { status: 404 }
      );
    }

    // Processar attachments
    const message = {
      ...rawMessage,
      attachments: rawMessage.attachments
        ? JSON.parse(rawMessage.attachments)
        : [],
      replies: rawMessage.replies.map((reply) => ({
        ...reply,
        attachments: reply.attachments ? JSON.parse(reply.attachments) : [],
      })),
    };

    // Marcar como lida se for o destinatário
    if (message.recipientId === user.id && !message.isRead) {
      await prisma.internalMessage.update({
        where: { id: messageId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
      message.isRead = true;
      message.readAt = new Date();
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Erro ao buscar mensagem:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Responder mensagem
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: messageId } = await params;
    const body = await request.json();
    const data = replyMessageSchema.parse(body);

    // Verificar se a mensagem existe e o usuário tem permissão
    const originalMessage = await prisma.internalMessage.findFirst({
      where: {
        id: messageId,
        OR: [
          { senderId: user.id as string },
          { recipientId: user.id as string },
        ],
      },
      include: {
        sender: { select: { id: true, name: true } },
        recipient: { select: { id: true, name: true } },
      },
    });

    if (!originalMessage) {
      return NextResponse.json(
        { error: "Mensagem não encontrada" },
        { status: 404 }
      );
    }

    // Determinar o destinatário da resposta
    const recipientId =
      originalMessage.senderId === user.id
        ? originalMessage.recipientId
        : originalMessage.senderId;

    // Criar resposta
    const rawReply = await prisma.messageReply.create({
      data: {
        messageId,
        senderId: user.id as string,
        content: data.content,
        attachments: JSON.stringify(data.attachments || []),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Processar attachments
    const reply = {
      ...rawReply,
      attachments: rawReply.attachments ? JSON.parse(rawReply.attachments) : [],
    };

    // Atualizar timestamp da mensagem original
    await prisma.internalMessage.update({
      where: { id: messageId },
      data: { updatedAt: new Date() },
    });

    // Criar notificação para o destinatário
    const recipientName =
      originalMessage.senderId === user.id
        ? originalMessage.recipient.name
        : originalMessage.sender.name;

    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: "message_reply",
        title: `${user.name} respondeu sua mensagem`,
        content: `Re: ${originalMessage.subject}`,
        category: "general",
        priority: "normal",
        actionUrl: `/dashboard/messages/${messageId}`,
        metadata: JSON.stringify({
          messageId,
          replyId: reply.id,
          senderId: user.id,
          senderName: user.name,
        }),
      },
    });

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao responder mensagem:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar mensagem (marcar como lida, favorita, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: messageId } = await params;
    const body = await request.json();
    const data = updateMessageSchema.parse(body);

    // Verificar se a mensagem existe e o usuário tem permissão
    const message = await prisma.internalMessage.findFirst({
      where: {
        id: messageId,
        OR: [
          { senderId: user.id as string },
          { recipientId: user.id as string },
        ],
      },
    });

    if (!message) {
      return NextResponse.json(
        { error: "Mensagem não encontrada" },
        { status: 404 }
      );
    }

    // Preparar dados para atualização
    const updateData: any = {};

    if (data.isRead !== undefined) {
      updateData.isRead = data.isRead;
      if (data.isRead) {
        updateData.readAt = new Date();
      }
    }

    if (data.isStarred !== undefined) {
      updateData.isStarred = data.isStarred;
    }

    if (data.isArchived !== undefined) {
      updateData.isArchived = data.isArchived;
    }

    // Atualizar mensagem
    const rawUpdatedMessage = await prisma.internalMessage.update({
      where: { id: messageId },
      data: updateData,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Processar attachments
    const updatedMessage = {
      ...rawUpdatedMessage,
      attachments: rawUpdatedMessage.attachments
        ? JSON.parse(rawUpdatedMessage.attachments)
        : [],
    };

    return NextResponse.json(updatedMessage);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar mensagem:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir mensagem
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: messageId } = await params;

    // Verificar se a mensagem existe e o usuário tem permissão
    const message = await prisma.internalMessage.findFirst({
      where: {
        id: messageId,
        OR: [
          { senderId: user.id as string },
          { recipientId: user.id as string },
        ],
      },
    });

    if (!message) {
      return NextResponse.json(
        { error: "Mensagem não encontrada" },
        { status: 404 }
      );
    }

    // Soft delete - marcar como excluída para o usuário
    const updateField =
      message.senderId === user.id ? "deletedBySender" : "deletedByRecipient";

    await prisma.internalMessage.update({
      where: { id: messageId },
      data: {
        [updateField]: true,
      },
    });

    return NextResponse.json({ message: "Mensagem excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir mensagem:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

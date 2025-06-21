import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema para criar mensagem
const createMessageSchema = z.object({
  recipientId: z.string().min(1, "Destinatário é obrigatório"),
  subject: z.string().min(1, "Assunto é obrigatório").max(255),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  attachments: z.array(z.string()).optional(),
});

// GET - Listar mensagens do usuário
export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "inbox"; // inbox, sent, drafts
    const isRead = searchParams.get("isRead");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    console.log(
      `📧 Buscando mensagens para usuário: ${user.id} (${user.name}) - Tipo: ${type} - Email: ${user.email}`
    );

    // Construir filtros baseado no tipo
    let where: any = {};

    if (type === "inbox") {
      where.recipientId = user.id as string;
      where.deletedByRecipient = false;
      where.isArchived = false;
    } else if (type === "sent") {
      where.senderId = user.id as string;
      where.deletedBySender = false;
      where.isArchived = false;
    } else if (type === "drafts") {
      where.senderId = user.id as string;
      where.isDraft = true;
      where.deletedBySender = false;
      where.isArchived = false;
    } else if (type === "archived") {
      where.OR = [
        {
          recipientId: user.id as string,
          isArchived: true,
          deletedByRecipient: false,
        },
        {
          senderId: user.id as string,
          isArchived: true,
          deletedBySender: false,
        },
      ];
    }

    // Filtros adicionais
    if (isRead !== null && type === "inbox") {
      where.isRead = isRead === "true";
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { sender: { name: { contains: search, mode: "insensitive" } } },
        { recipient: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    console.log(`🔍 Filtros aplicados:`, JSON.stringify(where, null, 2));

    // Buscar mensagens com relacionamentos
    const [rawMessages, total] = await Promise.all([
      prisma.internalMessage.findMany({
        where,
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
                  image: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: limit,
        skip: offset,
      }),
      prisma.internalMessage.count({ where }),
    ]);

    console.log(
      `📊 Encontradas ${rawMessages.length} mensagens de um total de ${total}`
    );

    // Processar attachments (converter JSON string para array)
    const messages = rawMessages.map((message) => ({
      ...message,
      attachments: message.attachments ? JSON.parse(message.attachments) : [],
      replies: message.replies.map((reply) => ({
        ...reply,
        attachments: reply.attachments ? JSON.parse(reply.attachments) : [],
      })),
    }));

    // Estatísticas para inbox
    let stats = {};
    if (type === "inbox") {
      const inboxStats = await prisma.internalMessage.groupBy({
        by: ["isRead"],
        where: {
          recipientId: user.id as string,
          isDraft: false,
          deletedByRecipient: false,
          isArchived: false,
        },
        _count: true,
      });

      const unreadCount = inboxStats.find((s) => !s.isRead)?._count || 0;
      const readCount = inboxStats.find((s) => s.isRead)?._count || 0;

      stats = {
        total: unreadCount + readCount,
        unread: unreadCount,
        read: readCount,
      };
    }

    return NextResponse.json({
      messages,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      stats,
    });
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar nova mensagem
export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const data = createMessageSchema.parse(body);

    console.log(
      `📤 Nova mensagem de ${user.name} (${user.id}) para ${data.recipientId}`
    );

    // Verificar se o destinatário existe
    const recipient = await prisma.user.findUnique({
      where: { id: data.recipientId },
      select: { id: true, name: true, email: true },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "Destinatário não encontrado" },
        { status: 404 }
      );
    }

    // Criar mensagem
    const rawMessage = await prisma.internalMessage.create({
      data: {
        senderId: user.id as string,
        recipientId: data.recipientId,
        subject: data.subject,
        content: data.content,
        priority: data.priority,
        attachments: JSON.stringify(data.attachments || []),
        isDraft: false,
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
    const message = {
      ...rawMessage,
      attachments: rawMessage.attachments
        ? JSON.parse(rawMessage.attachments)
        : [],
    };

    // Criar notificação para o destinatário
    await prisma.notification.create({
      data: {
        userId: data.recipientId,
        type: "message",
        title: `Nova mensagem de ${user.name}`,
        content: `Assunto: ${data.subject}`,
        category: "general",
        priority: data.priority,
        actionUrl: `/dashboard/messages/${message.id}`,
        metadata: JSON.stringify({
          messageId: message.id,
          senderId: user.id,
          senderName: user.name,
        }),
      },
    });

    console.log(`✅ Mensagem criada com sucesso: ID ${message.id}`);
    console.log(
      `🔔 Notificação criada para ${recipient.name} (${data.recipientId})`
    );

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao criar mensagem:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Marcar mensagens como lidas
export async function PUT(request: NextRequest) {
  try {
    const user = await getUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "mark-all-read") {
      await prisma.internalMessage.updateMany({
        where: {
          recipientId: user.id as string,
          isRead: false,
          deletedByRecipient: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "Todas as mensagens foram marcadas como lidas",
      });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("Erro ao atualizar mensagens:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

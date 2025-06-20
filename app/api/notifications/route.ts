import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validação para criar notificações
const createNotificationSchema = z.object({
  userId: z.string().optional(), // Se não fornecido, usa o usuário logado
  type: z.string(),
  title: z.string().min(1),
  content: z.string().min(1),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  category: z
    .enum(["booking", "resource", "maintenance", "system", "general"])
    .default("general"),
  actionUrl: z.string().optional(),
  metadata: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

// Schema para atualizar notificações
const updateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
  readAt: z.string().datetime().optional(),
});

// GET - Listar notificações do usuário
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isRead = searchParams.get("isRead");
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Construir filtros
    const where: any = {
      userId: user.id as string,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    };

    if (isRead !== null) {
      where.isRead = isRead === "true";
    }

    if (category) {
      where.category = category;
    }

    if (priority) {
      where.priority = priority;
    }

    // Buscar notificações
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where }),
    ]);

    // Estatísticas extras
    const stats = await prisma.notification.groupBy({
      by: ["isRead"],
      where: {
        userId: user.id as string,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      _count: true,
    });

    const unreadCount = stats.find((s) => !s.isRead)?._count || 0;
    const readCount = stats.find((s) => s.isRead)?._count || 0;

    return NextResponse.json({
      notifications,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      stats: {
        total: unreadCount + readCount,
        unread: unreadCount,
        read: readCount,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar nova notificação
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Apenas administradores podem criar notificações para outros usuários
    const isAdmin =
      user.role === "admin" ||
      user.role === "director" ||
      user.role === "diretor";

    const body = await request.json();
    const data = createNotificationSchema.parse(body);

    // Se não é admin e está tentando criar para outro usuário
    if (!isAdmin && data.userId && data.userId !== user.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const notification = await prisma.notification.create({
      data: {
        userId: data.userId || (user.id as string),
        type: data.type,
        title: data.title,
        content: data.content,
        priority: data.priority,
        category: data.category,
        actionUrl: data.actionUrl,
        metadata: data.metadata,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao criar notificação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Marcar todas como lidas
export async function PUT(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "mark-all-read") {
      await prisma.notification.updateMany({
        where: {
          userId: user.id as string,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "Todas as notificações foram marcadas como lidas",
      });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("Erro ao atualizar notificações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Limpar notificações antigas/lidas
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    let deleteCount = 0;

    if (action === "clear-read") {
      // Remover apenas notificações lidas
      const result = await prisma.notification.deleteMany({
        where: {
          userId: user.id as string,
          isRead: true,
        },
      });
      deleteCount = result.count;
    } else if (action === "clear-expired") {
      // Remover notificações expiradas
      const result = await prisma.notification.deleteMany({
        where: {
          userId: user.id as string,
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      deleteCount = result.count;
    } else if (action === "clear-old") {
      // Remover notificações antigas (mais de 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await prisma.notification.deleteMany({
        where: {
          userId: user.id as string,
          createdAt: {
            lt: thirtyDaysAgo,
          },
          isRead: true,
        },
      });
      deleteCount = result.count;
    } else {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }

    return NextResponse.json({
      message: `${deleteCount} notificações foram removidas`,
      count: deleteCount,
    });
  } catch (error) {
    console.error("Erro ao limpar notificações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

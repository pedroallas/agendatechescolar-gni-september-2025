import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    console.log("🔍 Teste de Mensagens - Usuário atual:", currentUser);

    // Buscar todas as mensagens relacionadas ao usuário atual
    const sentMessages = await prisma.internalMessage.findMany({
      where: {
        senderId: currentUser.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const receivedMessages = await prisma.internalMessage.findMany({
      where: {
        recipientId: currentUser.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Buscar todas as mensagens no sistema
    const allMessages = await prisma.internalMessage.findMany({
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Buscar todos os usuários
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    console.log("📊 Resultados do teste:");
    console.log("- Mensagens enviadas:", sentMessages.length);
    console.log("- Mensagens recebidas:", receivedMessages.length);
    console.log("- Total de mensagens no sistema:", allMessages.length);
    console.log("- Total de usuários:", allUsers.length);

    return NextResponse.json({
      currentUser,
      sentMessages,
      receivedMessages,
      allMessages,
      allUsers,
      summary: {
        sent: sentMessages.length,
        received: receivedMessages.length,
        total: allMessages.length,
        users: allUsers.length,
      },
    });
  } catch (error) {
    console.error("Erro no teste de mensagens:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Endpoint para criar uma mensagem de teste
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const { recipientEmail, subject, content } = await request.json();

    const recipient = await prisma.user.findUnique({
      where: { email: recipientEmail },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "Destinatário não encontrado" },
        { status: 404 }
      );
    }

    console.log("🧪 Criando mensagem de teste:");
    console.log("- De:", currentUser.name, "(", currentUser.email, ")");
    console.log("- Para:", recipient.name, "(", recipient.email, ")");
    console.log("- Assunto:", subject);

    const message = await prisma.internalMessage.create({
      data: {
        senderId: currentUser.id,
        recipientId: recipient.id,
        subject,
        content,
        priority: "normal",
        isRead: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    console.log("✅ Mensagem de teste criada:", message.id);

    // Verificar se a mensagem foi criada corretamente
    const verification = await prisma.internalMessage.findUnique({
      where: { id: message.id },
      include: {
        sender: true,
        recipient: true,
      },
    });

    return NextResponse.json({
      message: "Mensagem de teste criada com sucesso",
      createdMessage: message,
      verification,
    });
  } catch (error) {
    console.error("Erro ao criar mensagem de teste:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar o usuário atual no banco de dados
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

    // Verificar se há inconsistência entre sessão e banco
    const sessionUserId = session.user.id;
    const dbUserId = currentUser.id;

    const isInconsistent = sessionUserId !== dbUserId;

    console.log("🔍 Verificação de consistência da sessão:");
    console.log("- Email:", session.user.email);
    console.log("- ID na sessão:", sessionUserId);
    console.log("- ID no banco:", dbUserId);
    console.log("- Inconsistente:", isInconsistent);

    return NextResponse.json({
      sessionUser: {
        id: sessionUserId,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
      dbUser: currentUser,
      isInconsistent,
      message: isInconsistent
        ? "Inconsistência detectada. Faça logout e login novamente."
        : "Sessão consistente com o banco de dados.",
    });
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

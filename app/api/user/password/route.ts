import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // Log removido por segurança

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;
    // Log de dados removido por segurança

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Senha atual e nova senha são obrigatórias" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, password: true },
    });
    console.log("👤 Usuário encontrado:", {
      id: user?.id,
      hasPassword: !!user?.password,
    });

    if (!user) {
      console.log("❌ Usuário não encontrado");
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    if (!user.password) {
      console.log("❌ Usuário não possui senha definida");
      return NextResponse.json(
        { error: "Usuário não possui senha definida" },
        { status: 400 }
      );
    }

    // Verificar senha atual
    console.log("🔍 Verificando senha atual...");
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    console.log("✅ Senha atual válida:", isCurrentPasswordValid);

    if (!isCurrentPasswordValid) {
      console.log("❌ Senha atual incorreta");
      return NextResponse.json(
        { error: "Senha atual incorreta" },
        { status: 400 }
      );
    }

    // Criptografar nova senha
    console.log("🔒 Criptografando nova senha...");
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    console.log("✅ Nova senha criptografada");

    // Atualizar senha
    console.log("💾 Atualizando senha no banco de dados...");
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date(),
      },
    });
    console.log("✅ Senha atualizada com sucesso");

    return NextResponse.json({ message: "Senha alterada com sucesso" });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

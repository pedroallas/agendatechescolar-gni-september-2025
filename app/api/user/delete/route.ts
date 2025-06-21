import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se é um administrador (pode ser necessário manter pelo menos um)
    if (user.role === "admin") {
      const adminCount = await prisma.user.count({
        where: { role: "admin" },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Não é possível excluir o último administrador do sistema" },
          { status: 400 }
        );
      }
    }

    // Excluir dados relacionados em ordem correta (devido às foreign keys)
    await prisma.$transaction(async (tx) => {
      // Excluir dados relacionados
      await tx.messageReply.deleteMany({ where: { senderId: user.id } });
      await tx.internalMessage.deleteMany({
        where: { OR: [{ senderId: user.id }, { recipientId: user.id }] },
      });
      await tx.whatsAppMessage.deleteMany({ where: { userId: user.id } });
      await tx.emailLog.deleteMany({ where: { userId: user.id } });
      await tx.pushSubscription.deleteMany({ where: { userId: user.id } });
      await tx.communicationPreference.deleteMany({
        where: { userId: user.id },
      });
      await tx.notification.deleteMany({ where: { userId: user.id } });
      await tx.supportTicket.deleteMany({ where: { userId: user.id } });
      await tx.maintenanceRecord.deleteMany({ where: { userId: user.id } });
      await tx.resourceRating.deleteMany({ where: { userId: user.id } });
      await tx.booking.deleteMany({ where: { userId: user.id } });
      await tx.session.deleteMany({ where: { userId: user.id } });
      await tx.account.deleteMany({ where: { userId: user.id } });

      // Finalmente, excluir o usuário
      await tx.user.delete({ where: { id: user.id } });
    });

    return NextResponse.json({
      message: "Conta excluída com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import prisma from "@/lib/prisma";

// GET - Buscar histórico de manutenção de um recurso
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const maintenanceRecords = await prisma.maintenanceRecord.findMany({
      where: { resourceId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calcular estatísticas
    const totalRecords = maintenanceRecords.length;
    const pendingCount = maintenanceRecords.filter(
      (r) => r.status === "pending"
    ).length;
    const inProgressCount = maintenanceRecords.filter(
      (r) => r.status === "in_progress"
    ).length;
    const completedCount = maintenanceRecords.filter(
      (r) => r.status === "completed"
    ).length;

    // Calcular tempo médio de resolução (apenas para registros completos)
    const completedRecords = maintenanceRecords.filter(
      (r) => r.status === "completed" && r.resolvedAt && r.reportedAt
    );

    const averageResolutionTime =
      completedRecords.length > 0
        ? completedRecords.reduce((sum, record) => {
            const timeDiff =
              new Date(record.resolvedAt!).getTime() -
              new Date(record.reportedAt).getTime();
            return sum + timeDiff;
          }, 0) / completedRecords.length
        : 0;

    // Converter para dias
    const averageResolutionDays = Math.round(
      averageResolutionTime / (1000 * 60 * 60 * 24)
    );

    return NextResponse.json({
      records: maintenanceRecords,
      stats: {
        totalRecords,
        pendingCount,
        inProgressCount,
        completedCount,
        averageResolutionDays,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar histórico de manutenção:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar novo registro de manutenção
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Buscar o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se é admin (apenas admins podem reportar manutenção)
    if (!["diretor", "coordenador"].includes(user.role)) {
      return NextResponse.json(
        {
          error:
            "Acesso negado. Apenas administradores podem reportar manutenção.",
        },
        { status: 403 }
      );
    }

    const { type, priority, description, scheduledDate, estimatedCost } =
      await request.json();

    // Validações
    if (!type || !priority || !description) {
      return NextResponse.json(
        { error: "Tipo, prioridade e descrição são obrigatórios" },
        { status: 400 }
      );
    }

    const validTypes = ["preventive", "corrective", "emergency"];
    const validPriorities = ["low", "medium", "high", "urgent"];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Tipo de manutenção inválido" },
        { status: 400 }
      );
    }

    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: "Prioridade inválida" },
        { status: 400 }
      );
    }

    // Verificar se o recurso existe
    const resource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Recurso não encontrado" },
        { status: 404 }
      );
    }

    // Remover manutenção implícita se existir (será substituída pela real)
    const implicitMaintenanceToRemove =
      await prisma.maintenanceRecord.findFirst({
        where: {
          resourceId: id,
          type: "administrative",
          status: "pending",
        },
      });

    if (implicitMaintenanceToRemove) {
      await prisma.maintenanceRecord.delete({
        where: { id: implicitMaintenanceToRemove.id },
      });
      console.log(
        `🔄 Manutenção implícita substituída por manutenção real para recurso ${id}`
      );
    }

    // Criar o registro de manutenção
    const maintenanceRecord = await prisma.maintenanceRecord.create({
      data: {
        resourceId: id,
        userId: user.id,
        type,
        priority,
        description: description.trim(),
        status: "in_progress",
        reportedAt: new Date(),
        startedAt: new Date(),
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    // Marcar recurso como em manutenção (já que a manutenção está em andamento)
    await prisma.resource.update({
      where: { id },
      data: { status: "maintenance" },
    });

    console.log(
      `✅ Manutenção iniciada para recurso ${id}: ${type} - ${priority} por ${user.name}`
    );

    return NextResponse.json(maintenanceRecord, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar registro de manutenção:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

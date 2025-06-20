import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import prisma from "@/lib/prisma";

// PUT - Atualizar registro de manutenção
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id, recordId } = await params;

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

    const {
      status,
      solution,
      performedBy,
      actualCost,
      startedAt,
      resolvedAt,
      nextService,
    } = await request.json();

    // Verificar se o registro existe
    const existingRecord = await prisma.maintenanceRecord.findFirst({
      where: {
        id: recordId,
        resourceId: id,
      },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: "Registro de manutenção não encontrado" },
        { status: 404 }
      );
    }

    // Verificar permissões (admin ou próprio usuário)
    const isAdmin = ["diretor", "coordenador"].includes(user.role);
    const isOwner = existingRecord.userId === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Não autorizado a editar este registro" },
        { status: 403 }
      );
    }

    // Preparar dados para atualização
    const updateData: any = {};

    if (status) updateData.status = status;
    if (solution) updateData.solution = solution.trim();
    if (performedBy) updateData.performedBy = performedBy.trim();
    if (actualCost !== undefined)
      updateData.actualCost = parseFloat(actualCost);
    if (startedAt) updateData.startedAt = new Date(startedAt);
    if (resolvedAt) updateData.resolvedAt = new Date(resolvedAt);
    if (nextService) updateData.nextService = new Date(nextService);

    // Se o status mudou para "in_progress", definir startedAt se não foi fornecido
    if (status === "in_progress" && !startedAt && !existingRecord.startedAt) {
      updateData.startedAt = new Date();
    }

    // Se o status mudou para "completed", definir resolvedAt se não foi fornecido
    if (status === "completed" && !resolvedAt && !existingRecord.resolvedAt) {
      updateData.resolvedAt = new Date();
    }

    // Atualizar o registro
    const updatedRecord = await prisma.maintenanceRecord.update({
      where: { id: recordId },
      data: updateData,
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

    // Atualizar status do recurso baseado na manutenção
    if (status === "completed") {
      // Se a manutenção foi concluída, verificar se há outras ativas
      const activeMaintenance = await prisma.maintenanceRecord.findFirst({
        where: {
          resourceId: id,
          status: { in: ["pending", "in_progress"] },
          id: { not: recordId }, // Excluir o registro atual
        },
      });

      // Se não há outras manutenções ativas, marcar recurso como disponível
      if (!activeMaintenance) {
        await prisma.resource.update({
          where: { id },
          data: { status: "available" },
        });
        console.log(
          `🔄 Recurso ${id} marcado como disponível - todas as manutenções concluídas`
        );
      }
    }

    console.log(
      `✅ Registro de manutenção atualizado: ${recordId} - Status: ${status}`
    );

    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error("Erro ao atualizar registro de manutenção:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar registro de manutenção
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id, recordId } = await params;

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

    // Verificar se o registro existe
    const existingRecord = await prisma.maintenanceRecord.findFirst({
      where: {
        id: recordId,
        resourceId: id,
      },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: "Registro de manutenção não encontrado" },
        { status: 404 }
      );
    }

    // Verificar permissões (admin ou próprio usuário)
    const isAdmin = ["diretor", "coordenador"].includes(user.role);
    const isOwner = existingRecord.userId === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Não autorizado a deletar este registro" },
        { status: 403 }
      );
    }

    // Não permitir deletar registros em andamento ou concluídos (apenas admin)
    if (
      (existingRecord.status === "in_progress" ||
        existingRecord.status === "completed") &&
      !isAdmin
    ) {
      return NextResponse.json(
        {
          error: "Não é possível deletar registros em andamento ou concluídos",
        },
        { status: 403 }
      );
    }

    // Deletar o registro
    await prisma.maintenanceRecord.delete({
      where: { id: recordId },
    });

    console.log(
      `✅ Registro de manutenção deletado: ${recordId} do recurso ${id}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar registro de manutenção:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

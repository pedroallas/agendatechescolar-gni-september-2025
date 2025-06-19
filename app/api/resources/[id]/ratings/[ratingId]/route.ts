import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import prisma from "@/lib/prisma";

// PUT - Editar avaliação
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ratingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id, ratingId } = await params;
    const { rating, comment } = await request.json();

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

    // Validações
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Avaliação deve ser entre 1 e 5 estrelas" },
        { status: 400 }
      );
    }

    // Verificar se a avaliação existe e pertence ao usuário
    const existingRating = await prisma.resourceRating.findFirst({
      where: {
        id: ratingId,
        resourceId: id,
        userId: user.id,
      },
    });

    if (!existingRating) {
      return NextResponse.json(
        { error: "Avaliação não encontrada ou não autorizada" },
        { status: 404 }
      );
    }

    // Atualizar a avaliação
    const updatedRating = await prisma.resourceRating.update({
      where: { id: ratingId },
      data: {
        rating,
        comment: comment?.trim() || null,
        updatedAt: new Date(),
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

    // Recalcular estatísticas do recurso
    const allRatings = await prisma.resourceRating.findMany({
      where: { resourceId: id },
    });

    const totalRatings = allRatings.length;
    const averageRating =
      allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

    await prisma.resource.update({
      where: { id },
      data: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings,
      },
    });

    console.log(`✅ Avaliação atualizada: ${ratingId} - ${rating} estrelas`);

    return NextResponse.json(updatedRating);
  } catch (error) {
    console.error("Erro ao atualizar avaliação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar avaliação
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ratingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id, ratingId } = await params;

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

    // Verificar se a avaliação existe e pertence ao usuário (ou é admin)
    const existingRating = await prisma.resourceRating.findFirst({
      where: {
        id: ratingId,
        resourceId: id,
      },
    });

    if (!existingRating) {
      return NextResponse.json(
        { error: "Avaliação não encontrada" },
        { status: 404 }
      );
    }

    // Verificar permissão (próprio usuário ou admin)
    const isOwner = existingRating.userId === user.id;
    const isAdmin = ["diretor", "coordenador"].includes(user.role);

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Não autorizado a deletar esta avaliação" },
        { status: 403 }
      );
    }

    // Deletar a avaliação
    await prisma.resourceRating.delete({
      where: { id: ratingId },
    });

    // Recalcular estatísticas do recurso
    const allRatings = await prisma.resourceRating.findMany({
      where: { resourceId: id },
    });

    const totalRatings = allRatings.length;
    const averageRating =
      totalRatings > 0
        ? allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
        : 0;

    await prisma.resource.update({
      where: { id },
      data: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings,
      },
    });

    console.log(`✅ Avaliação deletada: ${ratingId} do recurso ${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar avaliação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

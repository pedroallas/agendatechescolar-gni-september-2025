import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import prisma from "@/lib/prisma";

// GET - Buscar avaliações de um recurso
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ratings = await prisma.resourceRating.findMany({
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
    const totalRatings = ratings.length;
    const averageRating =
      totalRatings > 0
        ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings
        : 0;

    const ratingDistribution = {
      5: ratings.filter((r) => r.rating === 5).length,
      4: ratings.filter((r) => r.rating === 4).length,
      3: ratings.filter((r) => r.rating === 3).length,
      2: ratings.filter((r) => r.rating === 2).length,
      1: ratings.filter((r) => r.rating === 1).length,
    };

    return NextResponse.json({
      ratings,
      stats: {
        totalRatings,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar nova avaliação
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

    // Verificar se o usuário já avaliou este recurso
    const existingRating = await prisma.resourceRating.findFirst({
      where: {
        resourceId: id,
        userId: user.id,
      },
    });

    if (existingRating) {
      return NextResponse.json(
        { error: "Você já avaliou este recurso" },
        { status: 409 }
      );
    }

    // Criar a avaliação
    const newRating = await prisma.resourceRating.create({
      data: {
        resourceId: id,
        userId: user.id,
        rating,
        comment: comment?.trim() || null,
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

    // Atualizar estatísticas do recurso
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

    console.log(
      `✅ Nova avaliação criada para recurso ${id}: ${rating} estrelas por ${user.name}`
    );

    return NextResponse.json(newRating, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar avaliação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

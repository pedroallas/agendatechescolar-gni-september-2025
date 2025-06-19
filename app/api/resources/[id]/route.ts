import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

// GET - Buscar um recurso específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const resource = await prisma.resource.findUnique({
      where: { id: params.id },
      include: {
        images: {
          orderBy: [
            { isPrimary: "desc" },
            { order: "asc" },
            { createdAt: "asc" },
          ],
        },
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        maintenanceHistory: {
          orderBy: { performedAt: "desc" },
          take: 5, // Últimos 5 registros
        },
        _count: {
          select: {
            bookings: true,
            ratings: true,
            maintenanceHistory: true,
          },
        },
      },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Recurso não encontrado" },
        { status: 404 }
      );
    }

    // Calcular média de avaliações se houver
    if (resource.ratings.length > 0) {
      const totalRating = resource.ratings.reduce(
        (sum, rating) => sum + rating.rating,
        0
      );
      resource.averageRating = totalRating / resource.ratings.length;
      resource.totalRatings = resource.ratings.length;

      // Atualizar no banco se necessário
      if (
        resource.averageRating !== resource.averageRating ||
        resource.totalRatings !== resource.totalRatings
      ) {
        await prisma.resource.update({
          where: { id: params.id },
          data: {
            averageRating: resource.averageRating,
            totalRatings: resource.totalRatings,
          },
        });
      }
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error("Erro ao buscar recurso:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar um recurso
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é admin
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
    });

    if (!user || !["diretor", "coordenador"].includes(user.role)) {
      return NextResponse.json(
        {
          error: "Acesso negado. Apenas administradores podem editar recursos.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Verificar se o recurso existe
    const existingResource = await prisma.resource.findUnique({
      where: { id: params.id },
    });

    if (!existingResource) {
      return NextResponse.json(
        { error: "Recurso não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar recurso
    const updatedResource = await prisma.resource.update({
      where: { id: params.id },
      data: {
        name: body.name,
        type: body.type,
        category: body.category,
        location: body.location,
        quantity: body.quantity,
        capacity: body.capacity,
        assetId: body.assetId,
        description: body.description,
        imageUrl: body.imageUrl,
        status: body.status,
        requiresApproval: body.requiresApproval,
        maintenanceNotes: body.maintenanceNotes,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        warrantyExpiry: body.warrantyExpiry
          ? new Date(body.warrantyExpiry)
          : null,
      },
      include: {
        images: {
          orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
        },
        _count: {
          select: {
            bookings: true,
            ratings: true,
          },
        },
      },
    });

    console.log(`✅ Recurso atualizado: ${updatedResource.name}`);

    return NextResponse.json(updatedResource);
  } catch (error) {
    console.error("Erro ao atualizar recurso:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Remover um recurso
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é admin
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
    });

    if (!user || !["diretor", "coordenador"].includes(user.role)) {
      return NextResponse.json(
        {
          error:
            "Acesso negado. Apenas administradores podem remover recursos.",
        },
        { status: 403 }
      );
    }

    // Verificar se o recurso existe
    const resource = await prisma.resource.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Recurso não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se há agendamentos ativos
    const activeBookings = await prisma.booking.count({
      where: {
        resourceId: params.id,
        date: {
          gte: new Date(),
        },
        status: {
          in: ["confirmed", "pending"],
        },
      },
    });

    if (activeBookings > 0) {
      return NextResponse.json(
        {
          error: `Não é possível remover este recurso pois há ${activeBookings} agendamento(s) ativo(s).`,
        },
        { status: 400 }
      );
    }

    // Remover o recurso (as imagens e outros relacionamentos serão removidos em cascata)
    await prisma.resource.delete({
      where: { id: params.id },
    });

    console.log(`✅ Recurso removido: ${resource.name}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover recurso:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

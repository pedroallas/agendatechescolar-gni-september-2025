import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

// GET - Buscar todas as imagens de um recurso
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const images = await prisma.resourceImage.findMany({
      where: { resourceId: params.id },
      orderBy: [
        { isPrimary: "desc" }, // Imagem principal primeiro
        { order: "asc" }, // Depois por ordem
        { createdAt: "asc" }, // Por último, por data
      ],
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error("Erro ao buscar imagens do recurso:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Adicionar nova imagem ao recurso
export async function POST(
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
            "Acesso negado. Apenas administradores podem gerenciar imagens.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { imageUrl, caption, isPrimary = false } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "URL da imagem é obrigatória" },
        { status: 400 }
      );
    }

    // Verificar se o recurso existe
    const resource = await prisma.resource.findUnique({
      where: { id: params.id },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Recurso não encontrado" },
        { status: 404 }
      );
    }

    // Se esta imagem será a principal, remover o status de principal das outras
    if (isPrimary) {
      await prisma.resourceImage.updateMany({
        where: { resourceId: params.id },
        data: { isPrimary: false },
      });
    }

    // Buscar a próxima ordem
    const lastImage = await prisma.resourceImage.findFirst({
      where: { resourceId: params.id },
      orderBy: { order: "desc" },
    });

    const nextOrder = lastImage ? lastImage.order + 1 : 0;

    const newImage = await prisma.resourceImage.create({
      data: {
        resourceId: params.id,
        imageUrl,
        caption,
        isPrimary,
        order: nextOrder,
      },
    });

    console.log(
      `✅ Nova imagem adicionada ao recurso ${params.id}:`,
      newImage.id
    );

    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar imagem:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar ordem das imagens (para drag & drop)
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
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const { images } = body; // Array com { id, order, isPrimary }

    if (!Array.isArray(images)) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
    }

    // Atualizar todas as imagens em uma transação
    await prisma.$transaction(
      images.map((img) =>
        prisma.resourceImage.update({
          where: { id: img.id },
          data: {
            order: img.order,
            isPrimary: img.isPrimary || false,
          },
        })
      )
    );

    console.log(`✅ Ordem das imagens atualizada para recurso ${params.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar ordem das imagens:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

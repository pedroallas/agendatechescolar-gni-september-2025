import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

// DELETE - Remover uma imagem específica
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
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

    // Verificar se a imagem existe e pertence ao recurso
    const image = await prisma.resourceImage.findFirst({
      where: {
        id: params.imageId,
        resourceId: params.id,
      },
    });

    if (!image) {
      return NextResponse.json(
        { error: "Imagem não encontrada" },
        { status: 404 }
      );
    }

    // Deletar a imagem
    await prisma.resourceImage.delete({
      where: { id: params.imageId },
    });

    // Se era a imagem principal, definir outra como principal
    if (image.isPrimary) {
      const nextImage = await prisma.resourceImage.findFirst({
        where: { resourceId: params.id },
        orderBy: { createdAt: "asc" },
      });

      if (nextImage) {
        await prisma.resourceImage.update({
          where: { id: nextImage.id },
          data: { isPrimary: true },
        });
      }
    }

    console.log(
      `✅ Imagem removida: ${params.imageId} do recurso ${params.id}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover imagem:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar uma imagem específica (legenda, status principal)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
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
    const { caption, isPrimary } = body;

    // Verificar se a imagem existe
    const image = await prisma.resourceImage.findFirst({
      where: {
        id: params.imageId,
        resourceId: params.id,
      },
    });

    if (!image) {
      return NextResponse.json(
        { error: "Imagem não encontrada" },
        { status: 404 }
      );
    }

    // Se vai ser a principal, remover o status das outras
    if (isPrimary && !image.isPrimary) {
      await prisma.resourceImage.updateMany({
        where: { resourceId: params.id },
        data: { isPrimary: false },
      });
    }

    // Atualizar a imagem
    const updatedImage = await prisma.resourceImage.update({
      where: { id: params.imageId },
      data: {
        caption,
        isPrimary: isPrimary !== undefined ? isPrimary : image.isPrimary,
      },
    });

    console.log(`✅ Imagem atualizada: ${params.imageId}`);

    return NextResponse.json(updatedImage);
  } catch (error) {
    console.error("Erro ao atualizar imagem:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

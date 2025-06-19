import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const resource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Recurso não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error("Erro ao buscar recurso:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao buscar o recurso" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

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

    // Atualizar o recurso
    const updatedResource = await prisma.resource.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedResource);
  } catch (error) {
    console.error("Erro ao atualizar recurso:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao atualizar o recurso" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Verificar se o recurso tem agendamentos
    const bookings = await prisma.booking.findMany({
      where: { resourceId: id },
    });

    if (bookings.length > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir um recurso que possui agendamentos" },
        { status: 400 }
      );
    }

    // Excluir o recurso
    await prisma.resource.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Recurso excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir recurso:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao excluir o recurso" },
      { status: 500 }
    );
  }
}

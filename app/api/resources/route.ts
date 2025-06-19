import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const whereClause = type && type !== "all" ? { type } : undefined;

    const resources = await prisma.resource.findMany({
      where: whereClause,
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
      orderBy: { name: "asc" },
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error("Erro ao buscar recursos:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao buscar os recursos." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validar dados
    if (!data.name || !data.type || !data.location) {
      return NextResponse.json(
        {
          error:
            "Dados incompletos. Nome, tipo e localização são obrigatórios.",
        },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.create({
      data,
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar recurso:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao criar o recurso." },
      { status: 500 }
    );
  }
}

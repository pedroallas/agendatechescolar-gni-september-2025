import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Função para converter horário em string para minutos desde meia-noite
function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shift = searchParams.get("shift");

    const whereClause = shift ? { shift } : undefined;

    const timeBlocks = await prisma.timeBlock.findMany({
      where: whereClause,
    });

    // Ordenar manualmente por horário de início (cronológico crescente)
    const sortedTimeBlocks = timeBlocks.sort((a, b) => {
      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    });

    return NextResponse.json(sortedTimeBlocks);
  } catch (error) {
    console.error("Erro ao buscar blocos de horário:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao buscar os blocos de horário." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validar dados
    if (!data.startTime || !data.endTime || !data.label || !data.shift) {
      return NextResponse.json(
        {
          error:
            "Dados incompletos. Horário de início, fim, rótulo e turno são obrigatórios.",
        },
        { status: 400 }
      );
    }

    const timeBlock = await prisma.timeBlock.create({
      data,
    });

    return NextResponse.json(timeBlock, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar bloco de horário:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao criar o bloco de horário." },
      { status: 500 }
    );
  }
}

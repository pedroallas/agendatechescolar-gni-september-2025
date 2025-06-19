import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verificar token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "fallback_secret"
    );
    const { payload } = await jwtVerify(token, secret);

    // Buscar usuário atualizado do banco de dados
    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erro ao obter usuário atual:", error);
    return NextResponse.json(
      { error: "Erro ao verificar autenticação" },
      { status: 401 }
    );
  }
}

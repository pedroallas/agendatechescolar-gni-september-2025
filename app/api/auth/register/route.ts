import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    // Validar dados
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Dados incompletos. Preencha todos os campos obrigatórios." },
        { status: 400 }
      );
    }

    // Verificar se o e-mail já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este e-mail já está em uso." },
        { status: 409 }
      );
    }

    // Validar domínio de e-mail institucional (pode ser personalizado)
    // if (!email.endsWith('@escola.edu.br')) {
    //   return NextResponse.json(
    //     { error: 'Por favor, use um e-mail institucional válido.' },
    //     { status: 400 }
    //   )
    // }

    // Hash da senha
    const hashedPassword = await hash(password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    // Retornar usuário sem a senha
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "Usuário criado com sucesso!",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao processar seu cadastro. Tente novamente." },
      { status: 500 }
    );
  }
}

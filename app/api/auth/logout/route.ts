import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    (await cookies()).delete("token");
    return NextResponse.json({ message: "Logout realizado com sucesso" });
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao fazer logout" },
      { status: 500 }
    );
  }
}

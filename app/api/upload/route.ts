import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo foi enviado" },
        { status: 400 }
      );
    }

    // Verificar se é uma imagem
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Apenas arquivos de imagem são permitidos" },
        { status: 400 }
      );
    }

    // Verificar tamanho (máximo 2MB para base64)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 2MB" },
        { status: 400 }
      );
    }

    // Converter para base64 (compatível com Vercel)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = file.type;

    // Criar data URL
    const imageUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      message: "Upload realizado com sucesso",
      imageUrl,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

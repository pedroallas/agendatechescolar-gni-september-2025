import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import prisma from "@/lib/prisma";
import QRCode from "qrcode";

// GET - Gerar QR Code para um recurso
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "png"; // png, svg, dataurl
    const size = parseInt(searchParams.get("size") || "200");

    // Verificar se o recurso existe
    const resource = await prisma.resource.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        qrCode: true,
      },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Recurso não encontrado" },
        { status: 404 }
      );
    }

    // URL que o QR Code vai apontar (página pública do recurso)
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resourceUrl = `${baseUrl}/resource/${id}`;

    // Gerar QR Code
    let qrCodeData: string;

    const qrOptions = {
      width: size,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    };

    switch (format) {
      case "svg":
        qrCodeData = await QRCode.toString(resourceUrl, {
          type: "svg",
          ...qrOptions,
        });
        return new Response(qrCodeData, {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=3600",
          },
        });

      case "dataurl":
        qrCodeData = await QRCode.toDataURL(resourceUrl, qrOptions);
        return NextResponse.json({
          qrCode: qrCodeData,
          url: resourceUrl,
          resourceName: resource.name,
        });

      case "png":
      default:
        const qrBuffer = await QRCode.toBuffer(resourceUrl, {
          type: "png",
          ...qrOptions,
        });
        return new Response(qrBuffer, {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=3600",
            "Content-Disposition": `inline; filename="qr-${resource.name.replace(
              /[^a-zA-Z0-9]/g,
              "-"
            )}.png"`,
          },
        });
    }
  } catch (error) {
    console.error("Erro ao gerar QR Code:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Salvar QR Code no banco (para cache)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar se é admin
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
    });

    if (!user || !["diretor", "coordenador"].includes(user.role)) {
      return NextResponse.json(
        {
          error: "Acesso negado. Apenas administradores podem gerar QR Codes.",
        },
        { status: 403 }
      );
    }

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

    // Gerar QR Code como Data URL para salvar no banco
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resourceUrl = `${baseUrl}/resource/${id}`;

    const qrCodeDataUrl = await QRCode.toDataURL(resourceUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Atualizar recurso com QR Code
    const updatedResource = await prisma.resource.update({
      where: { id },
      data: { qrCode: qrCodeDataUrl },
    });

    console.log(`✅ QR Code gerado e salvo para recurso: ${resource.name}`);

    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataUrl,
      url: resourceUrl,
    });
  } catch (error) {
    console.error("Erro ao salvar QR Code:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

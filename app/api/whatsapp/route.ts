import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema para enviar mensagem
const sendMessageSchema = z.object({
  phoneNumber: z.string().min(10, "Número de telefone inválido"),
  message: z.string().min(1, "Mensagem é obrigatória"),
  template: z.string().optional(),
  userId: z.string().optional(),
});

// Schema para webhook do WhatsApp
const webhookSchema = z.object({
  entry: z.array(
    z.object({
      id: z.string(),
      changes: z.array(
        z.object({
          value: z.object({
            messaging_product: z.string(),
            metadata: z.object({
              display_phone_number: z.string(),
              phone_number_id: z.string(),
            }),
            contacts: z
              .array(
                z.object({
                  profile: z.object({
                    name: z.string(),
                  }),
                  wa_id: z.string(),
                })
              )
              .optional(),
            messages: z
              .array(
                z.object({
                  from: z.string(),
                  id: z.string(),
                  timestamp: z.string(),
                  text: z
                    .object({
                      body: z.string(),
                    })
                    .optional(),
                  type: z.string(),
                })
              )
              .optional(),
            statuses: z
              .array(
                z.object({
                  id: z.string(),
                  status: z.string(),
                  timestamp: z.string(),
                  recipient_id: z.string(),
                })
              )
              .optional(),
          }),
          field: z.string(),
        })
      ),
    })
  ),
});

// Configurações do WhatsApp Business API
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

// GET - Verificação do webhook (WhatsApp)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Verificar webhook do WhatsApp
  if (mode === "subscribe" && token === WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    console.log("Webhook do WhatsApp verificado com sucesso");
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json(
    { error: "Token de verificação inválido" },
    { status: 403 }
  );
}

// POST - Receber webhook ou enviar mensagem
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "send") {
      return await handleSendMessage(request);
    } else {
      return await handleWebhook(request);
    }
  } catch (error) {
    console.error("Erro na API do WhatsApp:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Função para enviar mensagem
async function handleSendMessage(request: NextRequest) {
  const user = await getUser();
  if (!user?.id || (user.role !== "diretor" && user.role !== "coordenador")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const data = sendMessageSchema.parse(body);

  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    return NextResponse.json(
      { error: "WhatsApp não configurado" },
      { status: 500 }
    );
  }

  try {
    // Formatar número de telefone (remover caracteres especiais)
    const formattedPhone = data.phoneNumber.replace(/\D/g, "");

    // Preparar payload para WhatsApp API
    const whatsappPayload = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "text",
      text: {
        body: data.message,
      },
    };

    // Enviar mensagem via WhatsApp Business API
    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(whatsappPayload),
      }
    );

    const whatsappResult = await whatsappResponse.json();

    if (!whatsappResponse.ok) {
      throw new Error(
        whatsappResult.error?.message || "Erro ao enviar mensagem"
      );
    }

    // Salvar no banco de dados
    const whatsappMessage = await prisma.whatsAppMessage.create({
      data: {
        userId: data.userId || user.id,
        phoneNumber: formattedPhone,
        message: data.message,
        template: data.template,
        status: "sent",
        messageId: whatsappResult.messages?.[0]?.id,
      },
    });

    return NextResponse.json({
      success: true,
      messageId: whatsappResult.messages?.[0]?.id,
      whatsappId: whatsappMessage.id,
    });
  } catch (error) {
    console.error("Erro ao enviar mensagem WhatsApp:", error);

    // Salvar erro no banco
    await prisma.whatsAppMessage.create({
      data: {
        userId: data.userId || user.id,
        phoneNumber: data.phoneNumber.replace(/\D/g, ""),
        message: data.message,
        template: data.template,
        status: "failed",
        errorMessage:
          error instanceof Error ? error.message : "Erro desconhecido",
      },
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro ao enviar mensagem",
      },
      { status: 500 }
    );
  }
}

// Função para processar webhook
async function handleWebhook(request: NextRequest) {
  const body = await request.json();

  try {
    const webhookData = webhookSchema.parse(body);

    for (const entry of webhookData.entry) {
      for (const change of entry.changes) {
        const { value } = change;

        // Processar status de mensagens (entregue, lida, etc.)
        if (value.statuses) {
          for (const status of value.statuses) {
            await updateMessageStatus(status.id, status.status, {
              timestamp: status.timestamp,
              recipientId: status.recipient_id,
            });
          }
        }

        // Processar mensagens recebidas
        if (value.messages) {
          for (const message of value.messages) {
            await processIncomingMessage(message, value.metadata);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    return NextResponse.json({ success: true }); // Sempre retornar 200 para webhooks
  }
}

// Atualizar status da mensagem
async function updateMessageStatus(
  messageId: string,
  status: string,
  metadata: { timestamp: string; recipientId: string }
) {
  try {
    const updateData: any = { status };

    if (status === "delivered") {
      updateData.deliveredAt = new Date(parseInt(metadata.timestamp) * 1000);
    } else if (status === "read") {
      updateData.readAt = new Date(parseInt(metadata.timestamp) * 1000);
    }

    await prisma.whatsAppMessage.updateMany({
      where: { messageId },
      data: updateData,
    });

    console.log(`Status da mensagem ${messageId} atualizado para: ${status}`);
  } catch (error) {
    console.error("Erro ao atualizar status da mensagem:", error);
  }
}

// Processar mensagem recebida
async function processIncomingMessage(
  message: any,
  metadata: { display_phone_number: string; phone_number_id: string }
) {
  try {
    // Buscar usuário pelo número de telefone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: message.from },
          { phone: `+55${message.from}` },
          { phone: message.from.replace(/^\+55/, "") },
        ],
      },
    });

    // Salvar mensagem recebida
    await prisma.whatsAppMessage.create({
      data: {
        userId: user?.id,
        phoneNumber: message.from,
        message: message.text?.body || "[Mensagem não textual]",
        status: "received",
        messageId: message.id,
        webhookData: JSON.stringify({ message, metadata }),
      },
    });

    // Se for um usuário conhecido, criar notificação
    if (user) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "whatsapp_message",
          title: "Nova mensagem WhatsApp",
          content: message.text?.body || "Você recebeu uma nova mensagem",
          category: "communication",
          priority: "normal",
          metadata: JSON.stringify({
            messageId: message.id,
            phoneNumber: message.from,
          }),
        },
      });
    }

    console.log(`Mensagem recebida de ${message.from}: ${message.text?.body}`);
  } catch (error) {
    console.error("Erro ao processar mensagem recebida:", error);
  }
}

// PUT - Buscar histórico de mensagens
export async function PUT(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get("phoneNumber");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let where: any = {};

    // Filtrar por usuário se não for admin
    if (user.role !== "diretor" && user.role !== "coordenador") {
      where.userId = user.id;
    }

    // Filtrar por número de telefone se fornecido
    if (phoneNumber) {
      where.phoneNumber = phoneNumber.replace(/\D/g, "");
    }

    const [messages, total] = await Promise.all([
      prisma.whatsAppMessage.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.whatsAppMessage.count({ where }),
    ]);

    return NextResponse.json({
      messages,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

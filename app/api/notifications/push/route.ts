import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import webpush from "web-push";

// Configurar VAPID keys para Web Push
// Apenas configurar se as chaves estiverem definidas
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:admin@agendatech.edu.br",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Schema para subscrição push
const pushSubscriptionSchema = z.object({
  endpoint: z.string().url("Endpoint inválido"),
  keys: z.object({
    p256dh: z.string().min(1, "Chave p256dh obrigatória"),
    auth: z.string().min(1, "Chave auth obrigatória"),
  }),
});

// Schema para envio de push notification
const sendPushSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  body: z.string().min(1, "Mensagem obrigatória"),
  icon: z.string().optional(),
  badge: z.string().optional(),
  image: z.string().optional(),
  data: z.object({}).passthrough().optional(),
  actions: z
    .array(
      z.object({
        action: z.string(),
        title: z.string(),
        icon: z.string().optional(),
      })
    )
    .optional(),
  userIds: z.array(z.string()).optional(), // IDs específicos dos usuários
  broadcast: z.boolean().default(false), // Enviar para todos
});

// POST - Registrar subscrição push
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Se for para registrar subscrição
    if (body.type === "subscribe") {
      const subscriptionData = pushSubscriptionSchema.parse(body.subscription);

      // Salvar ou atualizar subscrição
      const subscription = await prisma.pushSubscription.upsert({
        where: {
          userId_endpoint: {
            userId: user.id as string,
            endpoint: subscriptionData.endpoint,
          },
        },
        update: {
          p256dh: subscriptionData.keys.p256dh,
          auth: subscriptionData.keys.auth,
          isActive: true,
        },
        create: {
          userId: user.id as string,
          endpoint: subscriptionData.endpoint,
          p256dh: subscriptionData.keys.p256dh,
          auth: subscriptionData.keys.auth,
          isActive: true,
        },
      });

      return NextResponse.json({
        success: true,
        subscriptionId: subscription.id,
      });
    }

    // Se for para enviar push notification
    if (body.type === "send") {
      // Apenas administradores podem enviar push notifications
      const isAdmin =
        user.role === "admin" ||
        user.role === "director" ||
        user.role === "diretor";
      if (!isAdmin) {
        return NextResponse.json(
          { error: "Sem permissão para enviar push notifications" },
          { status: 403 }
        );
      }

      const pushData = sendPushSchema.parse(body);

      let subscriptions = [];

      if (pushData.broadcast) {
        // Buscar todas as subscrições ativas
        subscriptions = await prisma.pushSubscription.findMany({
          where: { isActive: true },
          include: { user: true },
        });
      } else if (pushData.userIds && pushData.userIds.length > 0) {
        // Buscar subscrições de usuários específicos
        subscriptions = await prisma.pushSubscription.findMany({
          where: {
            userId: { in: pushData.userIds },
            isActive: true,
          },
          include: { user: true },
        });
      } else {
        return NextResponse.json(
          { error: "Especifique userIds ou use broadcast: true" },
          { status: 400 }
        );
      }

      const payload = JSON.stringify({
        title: pushData.title,
        body: pushData.body,
        icon: pushData.icon || "/icon-192x192.png",
        badge: pushData.badge || "/badge-72x72.png",
        image: pushData.image,
        data: {
          url: "/dashboard/notifications",
          timestamp: Date.now(),
          ...pushData.data,
        },
        actions: pushData.actions || [
          {
            action: "view",
            title: "Ver Detalhes",
          },
          {
            action: "dismiss",
            title: "Dispensar",
          },
        ],
      });

      const results = [];

      for (const subscription of subscriptions) {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          };

          const result = await webpush.sendNotification(
            pushSubscription,
            payload
          );

          results.push({
            userId: subscription.userId,
            success: true,
            statusCode: result.statusCode,
          });
        } catch (error: any) {
          console.error(
            `Erro ao enviar push para usuário ${subscription.userId}:`,
            error
          );

          // Se a subscrição expirou, marcar como inativa
          if (error.statusCode === 410) {
            await prisma.pushSubscription.update({
              where: { id: subscription.id },
              data: { isActive: false },
            });
          }

          results.push({
            userId: subscription.userId,
            success: false,
            error: error.message,
            statusCode: error.statusCode,
          });
        }
      }

      return NextResponse.json({
        success: true,
        sent: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        results,
      });
    }

    return NextResponse.json(
      { error: "Tipo de operação não especificado" },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro na API de push notifications:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar subscrição push
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint obrigatório" },
        { status: 400 }
      );
    }

    // Marcar subscrição como inativa
    await prisma.pushSubscription.updateMany({
      where: {
        userId: user.id as string,
        endpoint: decodeURIComponent(endpoint),
      },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao cancelar subscrição push:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// GET - Obter chave pública VAPID
export async function GET() {
  return NextResponse.json({
    publicKey:
      process.env.VAPID_PUBLIC_KEY || "BHdVZWJwdXNoLXRlc3QtcHVibGljLWtleQ",
  });
}

// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  try {
    // Limpar dados existentes (cuidado em produção!)
    await prisma.booking.deleteMany();
    await prisma.maintenanceBlock.deleteMany();
    await prisma.resource.deleteMany();
    await prisma.timeBlock.deleteMany();
    await prisma.user.deleteMany();

    console.log("🧹 Dados existentes removidos");

    // Criar usuários
    const adminPassword = await hash("admin123", 10);
    const userPassword = await hash("user123", 10);

    const admin = await prisma.user.create({
      data: {
        name: "Administrador",
        email: "admin@escola.edu.br",
        password: adminPassword,
        role: "diretor",
      },
    });

    const teacher = await prisma.user.create({
      data: {
        name: "Professor Exemplo",
        email: "professor@escola.edu.br",
        password: userPassword,
        role: "professor",
      },
    });

    console.log("👥 Usuários criados");

    // Criar blocos de horário
    const timeBlocks = await Promise.all([
      prisma.timeBlock.create({
        data: {
          startTime: "07:30",
          endTime: "08:20",
          label: "1ª Aula",
          shift: "morning",
        },
      }),
      prisma.timeBlock.create({
        data: {
          startTime: "08:20",
          endTime: "09:10",
          label: "2ª Aula",
          shift: "morning",
        },
      }),
      prisma.timeBlock.create({
        data: {
          startTime: "09:30",
          endTime: "10:20",
          label: "3ª Aula",
          shift: "morning",
        },
      }),
      prisma.timeBlock.create({
        data: {
          startTime: "10:20",
          endTime: "11:10",
          label: "4ª Aula",
          shift: "morning",
        },
      }),
      prisma.timeBlock.create({
        data: {
          startTime: "11:10",
          endTime: "12:00",
          label: "5ª Aula",
          shift: "morning",
        },
      }),
      prisma.timeBlock.create({
        data: {
          startTime: "13:20",
          endTime: "14:10",
          label: "6ª Aula",
          shift: "afternoon",
        },
      }),
      prisma.timeBlock.create({
        data: {
          startTime: "14:10",
          endTime: "15:00",
          label: "7ª Aula",
          shift: "afternoon",
        },
      }),
      prisma.timeBlock.create({
        data: {
          startTime: "15:30",
          endTime: "16:15",
          label: "8ª Aula",
          shift: "afternoon",
        },
      }),
      prisma.timeBlock.create({
        data: {
          startTime: "16:15",
          endTime: "17:00",
          label: "9ª Aula",
          shift: "afternoon",
        },
      }),
    ]);

    console.log("⏰ Blocos de horário criados");

    // Criar recursos
    const resources = await Promise.all([
      prisma.resource.create({
        data: {
          name: "Data Show 1",
          type: "equipment",
          category: "datashow",
          location: "Almoxarifado",
          assetId: "DS001",
          description: "Projetor multimídia com HDMI e VGA",
          status: "available",
        },
      }),
      prisma.resource.create({
        data: {
          name: "Data Show 2",
          type: "equipment",
          category: "datashow",
          location: "Almoxarifado",
          assetId: "DS002",
          description: "Projetor multimídia com HDMI e VGA",
          status: "maintenance",
        },
      }),
      prisma.resource.create({
        data: {
          name: 'TV 55"',
          type: "equipment",
          category: "tv",
          location: "Sala dos Professores",
          assetId: "TV001",
          description: "Smart TV com HDMI e Wi-Fi",
          status: "available",
        },
      }),
      prisma.resource.create({
        data: {
          name: "Chromebooks",
          type: "equipment",
          category: "chromebook",
          location: "Almoxarifado",
          quantity: 30,
          assetId: "CB001-030",
          description: "Conjunto de 30 Chromebooks para uso em sala",
          status: "available",
        },
      }),
      prisma.resource.create({
        data: {
          name: "Laboratório de Informática",
          type: "spaces",
          category: "lab",
          location: "Bloco B - Térreo",
          capacity: 30,
          description: "30 computadores com Windows 10 e pacote Office",
          status: "available",
        },
      }),
      prisma.resource.create({
        data: {
          name: "Biblioteca - Espaço de Eventos",
          type: "spaces",
          category: "library",
          location: "Bloco A - 1º Andar",
          capacity: 50,
          description: "Espaço para eventos, apresentações e reuniões",
          status: "available",
        },
      }),
    ]);

    console.log("📦 Recursos criados");

    // Criar alguns agendamentos de exemplo
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bookings = await Promise.all([
      prisma.booking.create({
        data: {
          resourceId: resources[0].id,
          userId: teacher.id,
          timeBlockId: timeBlocks[1].id,
          date: tomorrow,
          purpose: "Apresentação de projeto para a turma do 9º ano",
          status: "confirmed",
        },
      }),
      prisma.booking.create({
        data: {
          resourceId: resources[4].id,
          userId: teacher.id,
          timeBlockId: timeBlocks[2].id,
          date: tomorrow,
          purpose: "Aula prática de informática",
          status: "confirmed",
        },
      }),
    ]);

    console.log("📅 Agendamentos criados");

    // Criar notificações de exemplo (Fase 6)
    console.log("🔔 Criando notificações de exemplo...");

    const notifications = [
      {
        userId: admin.id,
        type: "booking_confirmed",
        title: "Agendamento confirmado",
        content:
          "Seu agendamento do Laboratório de Informática para amanhã às 14h foi confirmado.",
        priority: "normal",
        category: "booking",
        actionUrl: "/dashboard/my-bookings",
      },
      {
        userId: admin.id,
        type: "resource_approved",
        title: "Recurso aprovado",
        content:
          "O novo projetor multimídia foi aprovado e está disponível para agendamento.",
        priority: "high",
        category: "resource",
        actionUrl: "/dashboard/resources",
      },
      {
        userId: admin.id,
        type: "maintenance_scheduled",
        title: "Manutenção agendada",
        content:
          "Manutenção preventiva do ar-condicionado agendada para sexta-feira.",
        priority: "low",
        category: "maintenance",
        isRead: true,
        readAt: new Date(),
      },
      {
        userId: admin.id,
        type: "system_update",
        title: "Sistema atualizado",
        content:
          "Nova versão do AgendaTech disponível com melhorias de performance.",
        priority: "normal",
        category: "system",
      },
      {
        userId: admin.id,
        type: "booking_reminder",
        title: "Lembrete de agendamento",
        content:
          "Você tem um agendamento amanhã às 10h no Auditório Principal.",
        priority: "urgent",
        category: "booking",
        actionUrl: "/dashboard/my-bookings",
      },
    ];

    for (const notificationData of notifications) {
      await prisma.notification.create({
        data: notificationData,
      });
    }

    // Criar preferências de comunicação de exemplo
    await prisma.communicationPreference.create({
      data: {
        userId: admin.id,
        emailEnabled: true,
        pushEnabled: true,
        whatsappEnabled: false,
        emailFrequency: "immediate",
        reminderTime: 24,
        weekdaysOnly: false,
        categories: JSON.stringify([
          "booking",
          "resource",
          "maintenance",
          "system",
        ]),
      },
    });

    // Criar mensagens internas de exemplo (Fase 6)
    console.log("💬 Criando mensagens internas de exemplo...");

    const messages = [
      {
        senderId: admin.id,
        recipientId: teacher.id,
        subject: "Reunião pedagógica - Próxima semana",
        content:
          "Olá! Gostaria de agendar uma reunião pedagógica para discutirmos os novos recursos disponíveis na escola. Você tem disponibilidade na próxima semana? Por favor, me informe os melhores horários para você.",
        priority: "high",
        isRead: false,
      },
      {
        senderId: teacher.id,
        recipientId: admin.id,
        subject: "Re: Reunião pedagógica - Próxima semana",
        content:
          "Oi! Claro, vamos agendar sim. Tenho disponibilidade na terça-feira às 14h ou na quinta-feira às 10h. Qual horário funciona melhor para você?",
        priority: "normal",
        isRead: true,
        readAt: new Date(),
      },
      {
        senderId: admin.id,
        recipientId: teacher.id,
        subject: "Novos equipamentos chegaram",
        content:
          "Informo que chegaram os novos tablets que foram solicitados. Eles já estão catalogados no sistema e disponíveis para agendamento. Qualquer dúvida sobre como utilizá-los, estarei à disposição.",
        priority: "normal",
        isRead: false,
      },
      {
        senderId: teacher.id,
        recipientId: admin.id,
        subject: "Problema com projetor da sala 205",
        content:
          "Bom dia! O projetor da sala 205 está apresentando problemas na imagem (fica tremulando). Poderia verificar se é possível agendar uma manutenção? Preciso usar na aula de amanhã às 8h.",
        priority: "urgent",
        isRead: false,
      },
    ];

    const createdMessages = [];
    for (const messageData of messages) {
      const message = await prisma.internalMessage.create({
        data: messageData,
      });
      createdMessages.push(message);
    }

    // Criar algumas respostas para as mensagens
    await prisma.messageReply.create({
      data: {
        messageId: createdMessages[0].id,
        senderId: teacher.id,
        content:
          "Perfeito! Terça-feira às 14h funciona muito bem para mim. Podemos nos encontrar na sala de coordenação?",
      },
    });

    await prisma.messageReply.create({
      data: {
        messageId: createdMessages[3].id,
        senderId: admin.id,
        content:
          "Já entrei em contato com a equipe técnica. Eles vão verificar hoje à tarde. Como alternativa, você pode usar o projetor móvel que está no almoxarifado.",
      },
    });

    // Criar dados de exemplo para WhatsApp (simulados)
    console.log("📱 Criando histórico WhatsApp de exemplo...");

    const whatsappMessages = [
      {
        userId: admin.id,
        phoneNumber: "5511999887766",
        message:
          "Lembrete: Reunião de pais e mestres amanhã às 19h no auditório.",
        template: "meeting_reminder",
        status: "delivered",
        deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      },
      {
        userId: admin.id,
        phoneNumber: "5511888776655",
        message:
          "Sua solicitação de agendamento do laboratório foi aprovada para terça-feira às 14h.",
        template: "booking_approved",
        status: "read",
        deliveredAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hora atrás
        readAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min atrás
      },
      {
        phoneNumber: "5511777665544",
        message:
          "Bom dia! Gostaria de saber sobre a disponibilidade do auditório para evento no próximo mês.",
        status: "received",
      },
    ];

    for (const whatsappData of whatsappMessages) {
      await prisma.whatsAppMessage.create({
        data: whatsappData,
      });
    }

    console.log("✅ Seed concluído com sucesso!");
    console.log({
      users: { admin, teacher },
      timeBlocksCount: timeBlocks.length,
      resourcesCount: resources.length,
      bookingsCount: bookings.length,
      messagesCount: createdMessages.length,
    });
  } catch (error) {
    console.error("❌ Erro durante o seed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

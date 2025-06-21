import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function GET() {
  try {
    // Verificar se o usuário está autenticado e é admin
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Acesso negado. Faça login." },
        { status: 401 }
      );
    }

    if (session.user.role !== "diretor") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas diretores podem executar seed." },
        { status: 403 }
      );
    }
    // Limpar dados existentes (cuidado em produção!)
    await prisma.booking.deleteMany();
    await prisma.maintenanceBlock.deleteMany();
    await prisma.resource.deleteMany();
    await prisma.timeBlock.deleteMany();
    await prisma.user.deleteMany();

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
          requiresApproval: false, // Auto-confirmado
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
          requiresApproval: false,
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
          requiresApproval: false, // Auto-confirmado
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
          requiresApproval: true, // Requer aprovação do admin
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
          requiresApproval: true, // Requer aprovação do admin
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
          requiresApproval: true, // Requer aprovação do admin
        },
      }),
    ]);

    // Criar imagens de exemplo para os recursos
    const sampleImages = await Promise.all([
      // Imagens para Data Show 1
      prisma.resourceImage.create({
        data: {
          resourceId: resources[0].id,
          imageUrl:
            "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
          caption: "Data Show principal - vista frontal",
          isPrimary: true,
          order: 0,
        },
      }),
      prisma.resourceImage.create({
        data: {
          resourceId: resources[0].id,
          imageUrl:
            "https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800&h=600&fit=crop",
          caption: "Controles e conectores",
          isPrimary: false,
          order: 1,
        },
      }),
      // Imagens para TV 55"
      prisma.resourceImage.create({
        data: {
          resourceId: resources[2].id,
          imageUrl:
            "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=600&fit=crop",
          caption: "Smart TV 55 polegadas",
          isPrimary: true,
          order: 0,
        },
      }),
      // Imagens para Laboratório de Informática
      prisma.resourceImage.create({
        data: {
          resourceId: resources[4].id,
          imageUrl:
            "https://images.unsplash.com/photo-1562813733-b31f71025d54?w=800&h=600&fit=crop",
          caption: "Vista geral do laboratório",
          isPrimary: true,
          order: 0,
        },
      }),
      prisma.resourceImage.create({
        data: {
          resourceId: resources[4].id,
          imageUrl:
            "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&h=600&fit=crop",
          caption: "Estações de trabalho individuais",
          isPrimary: false,
          order: 1,
        },
      }),
    ]);

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

    // Criar avaliações de exemplo
    const sampleRatings = await Promise.all([
      // Avaliações para Data Show 1
      prisma.resourceRating.create({
        data: {
          resourceId: resources[0].id,
          userId: teacher.id,
          rating: 5,
          comment:
            "Excelente qualidade de imagem! Muito fácil de usar e conecta rapidamente com o notebook. Recomendo para apresentações importantes.",
        },
      }),
      prisma.resourceRating.create({
        data: {
          resourceId: resources[0].id,
          userId: admin.id,
          rating: 4,
          comment:
            "Bom equipamento, mas às vezes demora um pouco para reconhecer o sinal HDMI. No geral, atende bem às necessidades.",
        },
      }),
      // Avaliações para TV 55"
      prisma.resourceRating.create({
        data: {
          resourceId: resources[2].id,
          userId: teacher.id,
          rating: 5,
          comment:
            "Perfeita para videoconferências e apresentações! A qualidade da imagem é excelente e o sistema Smart TV facilita muito o uso.",
        },
      }),
      // Avaliações para Laboratório de Informática
      prisma.resourceRating.create({
        data: {
          resourceId: resources[4].id,
          userId: admin.id,
          rating: 4,
          comment:
            "Laboratório bem equipado com computadores atualizados. Alguns equipamentos precisam de manutenção, mas no geral é muito bom para aulas práticas.",
        },
      }),
    ]);

    // Criar registros de manutenção de exemplo
    const sampleMaintenanceRecords = await Promise.all([
      // Manutenção preventiva para Data Show 1
      prisma.maintenanceRecord.create({
        data: {
          resourceId: resources[0].id,
          userId: admin.id,
          type: "preventive",
          priority: "medium",
          status: "completed",
          description: "Limpeza dos filtros e calibração da imagem",
          solution:
            "Filtros limpos e configurações de imagem ajustadas. Funcionamento normal restaurado.",
          performedBy: "Técnico João Silva",
          reportedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
          startedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 dias atrás
          resolvedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 dias atrás
          actualCost: 50.0,
          nextService: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias no futuro
        },
      }),
      // Manutenção corretiva para Data Show 2 (em manutenção)
      prisma.maintenanceRecord.create({
        data: {
          resourceId: resources[1].id,
          userId: teacher.id,
          type: "corrective",
          priority: "high",
          status: "in_progress",
          description: "Lâmpada queimada, não está projetando imagem",
          performedBy: "Técnico João Silva",
          reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
          startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
          estimatedCost: 150.0,
        },
      }),
      // Manutenção pendente para Laboratório
      prisma.maintenanceRecord.create({
        data: {
          resourceId: resources[4].id,
          userId: teacher.id,
          type: "corrective",
          priority: "low",
          status: "pending",
          description:
            "Alguns computadores estão lentos, possível necessidade de limpeza de disco e atualização",
          reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
          scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias no futuro
          estimatedCost: 200.0,
        },
      }),
      // Manutenção de emergência concluída para TV 55"
      prisma.maintenanceRecord.create({
        data: {
          resourceId: resources[2].id,
          userId: admin.id,
          type: "emergency",
          priority: "urgent",
          status: "completed",
          description: "Tela preta após queda de energia, não liga",
          solution:
            "Problema na fonte de alimentação. Fonte substituída e sistema testado.",
          performedBy: "Técnico Maria Santos",
          reportedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 dias atrás
          startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 dias atrás
          resolvedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 dias atrás
          actualCost: 300.0,
        },
      }),
    ]);

    // Atualizar estatísticas dos recursos com avaliações
    await Promise.all([
      // Data Show 1 - média 4.5 (5+4)/2
      prisma.resource.update({
        where: { id: resources[0].id },
        data: {
          averageRating: 4.5,
          totalRatings: 2,
        },
      }),
      // TV 55" - média 5.0
      prisma.resource.update({
        where: { id: resources[2].id },
        data: {
          averageRating: 5.0,
          totalRatings: 1,
        },
      }),
      // Laboratório - média 4.0
      prisma.resource.update({
        where: { id: resources[4].id },
        data: {
          averageRating: 4.0,
          totalRatings: 1,
        },
      }),
    ]);

    return NextResponse.json({
      message: "Dados de exemplo criados com sucesso",
      data: {
        users: { admin, teacher },
        timeBlocks,
        resources,
        sampleImages,
        bookings,
        sampleRatings,
        sampleMaintenanceRecords,
      },
    });
  } catch (error) {
    console.error("Erro ao criar dados de exemplo:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao criar os dados de exemplo." },
      { status: 500 }
    );
  }
}

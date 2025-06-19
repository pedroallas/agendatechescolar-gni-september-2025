import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcrypt";

export async function GET() {
  try {
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

    return NextResponse.json({
      message: "Dados de exemplo criados com sucesso",
      data: {
        users: { admin, teacher },
        timeBlocks,
        resources,
        sampleImages,
        bookings,
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

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const resourceId = searchParams.get("resourceId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const resourceCategory = searchParams.get("resourceCategory");
    const timeBlockId = searchParams.get("timeBlockId");

    const whereClause: any = {};

    if (userId) {
      whereClause.userId = userId;
    }

    if (status) {
      whereClause.status = status;
    }

    if (resourceId) {
      whereClause.resourceId = resourceId;
    }

    if (timeBlockId) {
      whereClause.timeBlockId = timeBlockId;
    }

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      whereClause.date = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      whereClause.date = {
        lte: new Date(endDate),
      };
    }

    if (resourceCategory) {
      whereClause.resource = {
        category: resourceCategory,
      };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        resource: true,
        timeBlock: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { timeBlock: { startTime: "asc" } }],
    });

    console.log(`📋 Found ${bookings.length} bookings for query`);
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao buscar os agendamentos." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const {
      resourceId,
      userId,
      timeBlockId,
      date,
      purpose,
      isRecurring,
      recurringPattern,
    } = await request.json();

    // Validação dos dados recebidos

    // Validar dados
    if (!resourceId || !userId || !timeBlockId || !date || !purpose) {
      return NextResponse.json(
        { error: "Dados incompletos. Todos os campos são obrigatórios." },
        { status: 400 }
      );
    }

    // Verificar se os IDs existem no banco
    const [resourceExists, userExists, timeBlockExists] = await Promise.all([
      prisma.resource.findUnique({ where: { id: resourceId } }),
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.timeBlock.findUnique({ where: { id: timeBlockId } }),
    ]);

    if (!resourceExists) {
      return NextResponse.json(
        { error: "Recurso não encontrado." },
        { status: 400 }
      );
    }

    if (!userExists) {
      return NextResponse.json(
        {
          error: "Usuário não encontrado. Faça logout e login novamente.",
          forceLogout: true,
        },
        { status: 401 }
      );
    }

    if (!timeBlockExists) {
      return NextResponse.json(
        { error: "Horário não encontrado." },
        { status: 400 }
      );
    }

    // Validar padrão de recorrência
    if (isRecurring && recurringPattern) {
      if (
        recurringPattern.type === "weekly" &&
        (!recurringPattern.daysOfWeek ||
          recurringPattern.daysOfWeek.length === 0)
      ) {
        return NextResponse.json(
          {
            error:
              "Para agendamentos semanais, pelo menos um dia da semana deve ser selecionado.",
          },
          { status: 400 }
        );
      }
    }

    // Buscar informações do recurso para verificar se requer aprovação
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { requiresApproval: true, name: true },
    });

    // Definir status baseado na configuração do recurso
    const bookingStatus = resource?.requiresApproval ? "pending" : "confirmed";

    // Log para debug
    console.log(
      `🔍 Resource: ${resource?.name}, requiresApproval: ${resource?.requiresApproval}, status: ${bookingStatus}`
    );

    if (isRecurring && recurringPattern) {
      // Criar agendamentos recorrentes
      const bookingDates = generateRecurringDates(
        new Date(date),
        recurringPattern
      );
      const createdBookings = [];

      for (const bookingDate of bookingDates) {
        // Verificar conflitos para cada data
        const existingBooking = await prisma.booking.findFirst({
          where: {
            resourceId,
            timeBlockId,
            date: bookingDate,
            NOT: {
              status: "cancelled",
            },
          },
        });

        if (!existingBooking) {
          try {
            const booking = await prisma.booking.create({
              data: {
                resourceId,
                userId,
                timeBlockId,
                date: bookingDate,
                purpose,
                status: bookingStatus,
                isRecurring: true,
                recurringPattern: JSON.stringify(recurringPattern),
              },
              include: {
                resource: true,
                timeBlock: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                  },
                },
              },
            });
            createdBookings.push(booking);
          } catch (error) {
            console.error(
              `Erro ao criar agendamento para ${bookingDate.toISOString()}:`,
              error
            );
          }
        }
      }

      if (createdBookings.length === 0) {
        return NextResponse.json(
          {
            error:
              "Não foi possível criar nenhum agendamento recorrente. Verifique se os horários estão disponíveis.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          message: `${createdBookings.length} agendamento(s) recorrente(s) criado(s) com sucesso.`,
          bookings: createdBookings,
          conflicts: bookingDates.length - createdBookings.length,
        },
        { status: 201 }
      );
    } else {
      // Criar agendamento único
      const existingBooking = await prisma.booking.findFirst({
        where: {
          resourceId,
          timeBlockId,
          date: new Date(date),
          NOT: {
            status: "cancelled",
          },
        },
      });

      if (existingBooking) {
        return NextResponse.json(
          { error: "Este recurso já está agendado para esta data e horário." },
          { status: 409 }
        );
      }

      const booking = await prisma.booking.create({
        data: {
          resourceId,
          userId,
          timeBlockId,
          date: new Date(date),
          purpose,
          status: bookingStatus,
          isRecurring: false,
        },
        include: {
          resource: true,
          timeBlock: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      // Log simples para debug
      console.log(`✅ Booking created: ${booking.id} - ${purpose}`);

      // Contar total de bookings no banco
      const totalBookings = await prisma.booking.count();
      console.log(`📊 Total bookings in database: ${totalBookings}`);

      return NextResponse.json(booking, { status: 201 });
    }
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao criar o agendamento." },
      { status: 500 }
    );
  }
}

// Função auxiliar para gerar datas recorrentes
function generateRecurringDates(startDate: Date, pattern: any): Date[] {
  const dates: Date[] = [];
  const endDate = pattern.endDate
    ? new Date(pattern.endDate)
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 ano se não especificado
  let currentDate = new Date(startDate);

  // Limite de segurança para evitar loops infinitos
  const maxIterations = 365;
  let iterations = 0;

  while (currentDate <= endDate && iterations < maxIterations) {
    if (pattern.type === "daily") {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + pattern.interval);
    } else if (pattern.type === "weekly") {
      // Para agendamentos semanais, considerar os dias da semana especificados
      if (
        pattern.daysOfWeek &&
        pattern.daysOfWeek.includes(currentDate.getDay())
      ) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);

      // Quando completar uma semana, avançar pelo intervalo
      if (currentDate.getDay() === 0) {
        // Domingo
        currentDate.setDate(currentDate.getDate() + (pattern.interval - 1) * 7);
      }
    } else if (pattern.type === "monthly") {
      dates.push(new Date(currentDate));
      currentDate.setMonth(currentDate.getMonth() + pattern.interval);
    }

    iterations++;
  }

  return dates;
}

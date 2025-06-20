import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import prisma from "@/lib/prisma";
import { subMonths, format } from "date-fns";

// GET - Obter dados para relatórios
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é admin
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
    });

    if (!user || !["diretor", "coordenador"].includes(user.role)) {
      return NextResponse.json(
        {
          error:
            "Acesso negado. Apenas administradores podem acessar relatórios.",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type") || "overview";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const resourceId = searchParams.get("resourceId");

    // Definir período padrão (últimos 6 meses)
    const defaultEndDate = new Date();
    const defaultStartDate = subMonths(defaultEndDate, 6);

    const dateFilter = {
      gte: startDate ? new Date(startDate) : defaultStartDate,
      lte: endDate ? new Date(endDate) : defaultEndDate,
    };

    switch (reportType) {
      case "overview":
        return NextResponse.json(await getOverviewData(dateFilter, resourceId));

      case "usage":
        return NextResponse.json(await getUsageData(dateFilter, resourceId));

      case "resources":
        return NextResponse.json(await getResourcesData(dateFilter));

      case "maintenance":
        return NextResponse.json(
          await getMaintenanceData(dateFilter, resourceId)
        );

      case "users":
        return NextResponse.json(await getUsersData(dateFilter));

      default:
        return NextResponse.json(
          { error: "Tipo de relatório inválido" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Dados gerais do sistema
async function getOverviewData(dateFilter: any, resourceId?: string | null) {
  const resourceFilter = resourceId ? { resourceId } : {};

  const [
    totalBookings,
    totalResources,
    totalUsers,
    totalMaintenance,
    bookingsByStatus,
    recentBookings,
    topResources,
  ] = await Promise.all([
    // Total de agendamentos no período
    prisma.booking.count({
      where: {
        ...resourceFilter,
        date: dateFilter,
      },
    }),

    // Total de recursos
    prisma.resource.count(),

    // Total de usuários
    prisma.user.count(),

    // Total de manutenções no período
    prisma.maintenanceRecord.count({
      where: {
        ...resourceFilter,
        reportedAt: dateFilter,
      },
    }),

    // Agendamentos por status
    prisma.booking.groupBy({
      by: ["status"],
      where: {
        ...resourceFilter,
        date: dateFilter,
      },
      _count: true,
    }),

    // Agendamentos recentes
    prisma.booking.findMany({
      where: {
        ...resourceFilter,
        date: dateFilter,
      },
      include: {
        resource: {
          select: { name: true },
        },
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),

    // Recursos mais utilizados
    prisma.booking.groupBy({
      by: ["resourceId"],
      where: {
        ...resourceFilter,
        date: dateFilter,
      },
      _count: true,
      orderBy: {
        _count: { resourceId: "desc" },
      },
      take: 5,
    }),
  ]);

  // Buscar nomes dos recursos mais utilizados
  const resourceIds = topResources.map((r) => r.resourceId);
  const resourceNames = await prisma.resource.findMany({
    where: { id: { in: resourceIds } },
    select: { id: true, name: true },
  });

  const topResourcesWithNames = topResources.map((resource) => ({
    ...resource,
    name:
      resourceNames.find((r) => r.id === resource.resourceId)?.name ||
      "Recurso não encontrado",
  }));

  return {
    summary: {
      totalBookings,
      totalResources,
      totalUsers,
      totalMaintenance,
    },
    bookingsByStatus: bookingsByStatus.map((item) => ({
      status: item.status,
      count: item._count,
      label: getStatusLabel(item.status),
    })),
    recentBookings,
    topResources: topResourcesWithNames,
  };
}

// Dados de uso detalhado
async function getUsageData(dateFilter: any, resourceId?: string | null) {
  const resourceFilter = resourceId ? { resourceId } : {};

  const [
    bookingsByMonth,
    bookingsByWeekday,
    bookingsByHour,
    bookingsByResource,
  ] = await Promise.all([
    // Agendamentos por mês (geral)
    prisma.booking.findMany({
      where: {
        ...resourceFilter,
        date: dateFilter,
      },
      select: {
        date: true,
      },
    }),

    // Agendamentos por dia da semana
    prisma.booking.findMany({
      where: {
        ...resourceFilter,
        date: dateFilter,
      },
      select: {
        date: true,
      },
    }),

    // Agendamentos por hora
    prisma.booking.findMany({
      where: {
        ...resourceFilter,
        date: dateFilter,
      },
      select: {
        timeBlock: {
          select: {
            startTime: true,
          },
        },
      },
    }),

    // Agendamentos por recurso (total)
    prisma.booking.groupBy({
      by: ["resourceId"],
      where: {
        ...resourceFilter,
        date: dateFilter,
      },
      _count: true,
      orderBy: {
        _count: { resourceId: "desc" },
      },
    }),
  ]);

  // Processar dados no JavaScript
  const monthlyData = processMonthlyData(bookingsByMonth);
  const weekdayData = processWeekdayData(bookingsByWeekday);
  const hourlyData = processHourlyData(bookingsByHour);
  const resourceData = await processResourceData(bookingsByResource);

  return {
    monthlyData,
    weekdayData,
    hourlyData,
    resourceData,
  };
}

// Dados de recursos
async function getResourcesData(dateFilter: any) {
  const [resourceStats, resourcesByCategory, resourcesByStatus] =
    await Promise.all([
      // Estatísticas por recurso
      prisma.resource.findMany({
        include: {
          _count: {
            select: {
              bookings: {
                where: { date: dateFilter },
              },
              ratings: true,
            },
          },
        },
      }),

      // Recursos por categoria
      prisma.resource.groupBy({
        by: ["category"],
        _count: true,
      }),

      // Recursos por status
      prisma.resource.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

  return {
    resourceStats,
    resourcesByCategory,
    resourcesByStatus,
  };
}

// Dados de manutenção
async function getMaintenanceData(dateFilter: any, resourceId?: string | null) {
  const resourceFilter = resourceId ? { resourceId } : {};

  const [maintenanceStats, maintenanceByType, maintenanceByStatus] =
    await Promise.all([
      // Estatísticas gerais
      prisma.maintenanceRecord.findMany({
        where: {
          ...resourceFilter,
          reportedAt: dateFilter,
        },
        include: {
          resource: {
            select: { name: true },
          },
        },
      }),

      // Por tipo
      prisma.maintenanceRecord.groupBy({
        by: ["type"],
        where: {
          ...resourceFilter,
          reportedAt: dateFilter,
        },
        _count: true,
      }),

      // Por status
      prisma.maintenanceRecord.groupBy({
        by: ["status"],
        where: {
          ...resourceFilter,
          reportedAt: dateFilter,
        },
        _count: true,
      }),
    ]);

  return {
    maintenanceStats,
    maintenanceByType,
    maintenanceByStatus,
  };
}

// Dados de usuários
async function getUsersData(dateFilter: any) {
  const [usersByRole, topUsers] = await Promise.all([
    // Usuários por papel
    prisma.user.groupBy({
      by: ["role"],
      _count: true,
    }),

    // Usuários mais ativos
    prisma.booking.groupBy({
      by: ["userId"],
      where: { date: dateFilter },
      _count: true,
      orderBy: {
        _count: { userId: "desc" },
      },
      take: 10,
    }),
  ]);

  // Buscar nomes dos usuários mais ativos
  const userIds = topUsers.map((u) => u.userId);
  const userNames = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, role: true },
  });

  const topUsersWithNames = topUsers.map((user) => ({
    ...user,
    name:
      userNames.find((u) => u.id === user.userId)?.name ||
      "Usuário não encontrado",
    role: userNames.find((u) => u.id === user.userId)?.role || "unknown",
  }));

  return {
    usersByRole,
    topUsers: topUsersWithNames,
  };
}

// Funções auxiliares
function getStatusLabel(status: string) {
  const labels: { [key: string]: string } = {
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Rejeitado",
    completed: "Concluído",
    cancelled: "Cancelado",
  };
  return labels[status] || status;
}

function processMonthlyData(bookings: any[]) {
  const monthCounts: { [key: string]: number } = {};

  bookings.forEach((booking) => {
    const month = format(new Date(booking.date), "yyyy-MM");
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });

  return Object.entries(monthCounts).map(([month, count]) => ({
    month,
    count,
    label: format(new Date(month + "-01"), "MMM yyyy"),
  }));
}

function processWeekdayData(bookings: any[]) {
  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const weekdayCounts = new Array(7).fill(0);

  bookings.forEach((booking) => {
    const day = new Date(booking.date).getDay();
    weekdayCounts[day]++;
  });

  return weekdayCounts.map((count, index) => ({
    day: weekdays[index],
    count,
  }));
}

function processHourlyData(bookings: any[]) {
  const hourCounts: { [key: number]: number } = {};

  bookings.forEach((booking) => {
    const hour = parseInt(booking.timeBlock.startTime.split(":")[0]);
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  return Object.entries(hourCounts).map(([hour, count]) => ({
    hour: parseInt(hour),
    count,
    label: `${hour}:00`,
  }));
}

async function processResourceData(bookingsByResource: any[]) {
  // Buscar nomes dos recursos
  const resourceIds = bookingsByResource.map((r) => r.resourceId);
  const resourceNames = await prisma.resource.findMany({
    where: { id: { in: resourceIds } },
    select: { id: true, name: true },
  });

  // Mapear dados com nomes dos recursos
  return bookingsByResource.map((resource) => ({
    resourceId: resource.resourceId,
    name:
      resourceNames.find((r) => r.id === resource.resourceId)?.name ||
      "Recurso não encontrado",
    totalBookings: resource._count,
  }));
}

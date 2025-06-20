import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import prisma from "@/lib/prisma";
import { subMonths, format } from "date-fns";

// POST - Exportar relatório
export async function POST(request: NextRequest) {
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
            "Acesso negado. Apenas administradores podem exportar relatórios.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, format, startDate, endDate, resourceId } = body;

    // Definir período padrão
    const defaultEndDate = new Date();
    const defaultStartDate = subMonths(defaultEndDate, 6);

    const dateFilter = {
      gte: startDate ? new Date(startDate) : defaultStartDate,
      lte: endDate ? new Date(endDate) : defaultEndDate,
    };

    // Buscar dados baseado no tipo
    let data;
    let title;

    switch (type) {
      case "overview":
        data = await getOverviewData(dateFilter, resourceId);
        title = "Relatório de Visão Geral";
        break;
      case "usage":
        data = await getUsageData(dateFilter, resourceId);
        title = "Relatório de Uso Detalhado";
        break;
      case "resources":
        data = await getResourcesData(dateFilter);
        title = "Relatório de Recursos";
        break;
      case "maintenance":
        data = await getMaintenanceData(dateFilter, resourceId);
        title = "Relatório de Manutenção";
        break;
      case "users":
        data = await getUsersData(dateFilter);
        title = "Relatório de Usuários";
        break;
      default:
        return NextResponse.json(
          { error: "Tipo de relatório inválido" },
          { status: 400 }
        );
    }

    // Para agora, retornar JSON (implementação completa de PDF/Excel pode ser adicionada depois)
    return NextResponse.json({
      success: true,
      message: "Dados do relatório preparados para exportação",
      data,
      metadata: {
        title,
        period: {
          start: format(dateFilter.gte, "dd/MM/yyyy"),
          end: format(dateFilter.lte, "dd/MM/yyyy"),
        },
        generatedAt: format(new Date(), "dd/MM/yyyy HH:mm"),
      },
    });
  } catch (error) {
    console.error("Erro ao exportar relatório:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Funções auxiliares
async function getOverviewData(dateFilter: any, resourceId?: string | null) {
  const resourceFilter = resourceId ? { resourceId } : {};

  const [
    totalBookings,
    totalResources,
    totalUsers,
    totalMaintenance,
    bookingsByStatus,
    topResources,
  ] = await Promise.all([
    prisma.booking.count({
      where: {
        ...resourceFilter,
        date: dateFilter,
      },
    }),
    prisma.resource.count(),
    prisma.user.count(),
    prisma.maintenanceRecord.count({
      where: {
        ...resourceFilter,
        reportedAt: dateFilter,
      },
    }),
    prisma.booking.groupBy({
      by: ["status"],
      where: {
        ...resourceFilter,
        date: dateFilter,
      },
      _count: true,
    }),
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
      take: 10,
    }),
  ]);

  // Buscar nomes dos recursos
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
    topResources: topResourcesWithNames,
  };
}

async function getUsageData(dateFilter: any, resourceId?: string | null) {
  const resourceFilter = resourceId ? { resourceId } : {};

  const [bookingsByMonth, bookingsByWeekday] = await Promise.all([
    prisma.booking.findMany({
      where: {
        ...resourceFilter,
        date: dateFilter,
      },
      select: {
        date: true,
      },
    }),
    prisma.booking.findMany({
      where: {
        ...resourceFilter,
        date: dateFilter,
      },
      select: {
        date: true,
      },
    }),
  ]);

  return {
    monthlyData: processMonthlyData(bookingsByMonth),
    weekdayData: processWeekdayData(bookingsByWeekday),
  };
}

async function getResourcesData(dateFilter: any) {
  const [resourcesByCategory, resourcesByStatus] = await Promise.all([
    prisma.resource.groupBy({
      by: ["category"],
      _count: true,
    }),
    prisma.resource.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  return {
    resourcesByCategory,
    resourcesByStatus,
  };
}

async function getMaintenanceData(dateFilter: any, resourceId?: string | null) {
  const resourceFilter = resourceId ? { resourceId } : {};

  const [maintenanceByType, maintenanceByStatus] = await Promise.all([
    prisma.maintenanceRecord.groupBy({
      by: ["type"],
      where: {
        ...resourceFilter,
        reportedAt: dateFilter,
      },
      _count: true,
    }),
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
    maintenanceByType,
    maintenanceByStatus,
  };
}

async function getUsersData(dateFilter: any) {
  const [usersByRole, topUsers] = await Promise.all([
    prisma.user.groupBy({
      by: ["role"],
      _count: true,
    }),
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

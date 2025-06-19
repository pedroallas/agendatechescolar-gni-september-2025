"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { SimpleTour } from "@/components/simple-tour";
import { StatsCard } from "@/components/dashboard/stats-card";
import { BookingsChart } from "@/components/dashboard/bookings-chart";
import { MiniCalendar } from "@/components/dashboard/mini-calendar";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { NotificationsWidget } from "@/components/dashboard/notifications-widget";
import { DraggableDashboard } from "@/components/dashboard/draggable-dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Package,
  TrendingUp,
  Clock,
  Users,
  Activity,
  Laptop,
  BookOpen,
  Layout,
  LayoutDashboard,
} from "lucide-react";
import { addDays, startOfMonth } from "date-fns";

const tourSteps = [
  {
    title: "Bem-vindo ao novo Dashboard! 🎉",
    content:
      "Este é o seu painel principal completamente renovado com widgets interativos e notificações em tempo real.",
  },
  {
    title: "Estatísticas em Tempo Real",
    content:
      "Cards animados mostram métricas importantes com tendências e comparações.",
  },
  {
    title: "Gráficos Interativos",
    content: "Visualize o uso de recursos com gráficos modernos e responsivos.",
  },
  {
    title: "Mini Calendário",
    content:
      "Veja seus próximos agendamentos e navegue entre os meses facilmente.",
  },
  {
    title: "Ações Rápidas",
    content: "Acesse as funcionalidades mais usadas com apenas um clique.",
  },
  {
    title: "Notificações",
    content:
      "Receba atualizações em tempo real sobre seus agendamentos e o sistema.",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [isDraggableMode, setIsDraggableMode] = useState(false);

  // Dados mockados (em produção viriam da API)
  const chartData = [
    { name: "Seg", equipamentos: 4, espacos: 2 },
    { name: "Ter", equipamentos: 3, espacos: 4 },
    { name: "Qua", equipamentos: 5, espacos: 3 },
    { name: "Qui", equipamentos: 2, espacos: 4 },
    { name: "Sex", equipamentos: 6, espacos: 2 },
    { name: "Sáb", equipamentos: 1, espacos: 1 },
    { name: "Dom", equipamentos: 0, espacos: 0 },
  ];

  const mockBookings = [
    {
      id: "1",
      date: addDays(new Date(), 1),
      resource: "Data Show 1",
      type: "equipment" as const,
    },
    {
      id: "2",
      date: addDays(new Date(), 2),
      resource: "Lab de Informática",
      type: "space" as const,
    },
    {
      id: "3",
      date: addDays(new Date(), 5),
      resource: "Chromebooks",
      type: "equipment" as const,
    },
  ];

  const statsData = [
    {
      title: "Agendamentos Hoje",
      value: "12",
      description: "+2 desde ontem",
      icon: Calendar,
      trend: { value: 20, isPositive: true },
      color: "blue" as const,
    },
    {
      title: "Recursos Disponíveis",
      value: "8",
      description: "2 em manutenção",
      icon: Package,
      trend: { value: 10, isPositive: false },
      color: "green" as const,
    },
    {
      title: "Taxa de Ocupação",
      value: "73%",
      description: "Média semanal",
      icon: TrendingUp,
      trend: { value: 5, isPositive: true },
      color: "purple" as const,
    },
    {
      title: "Próximo Agendamento",
      value: "14:30",
      description: "Lab de Informática",
      icon: Clock,
      color: "orange" as const,
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <SimpleTour steps={tourSteps} />

      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Olá, {user?.name?.split(" ")[0]}! 👋
          </h2>
          <p className="text-muted-foreground">
            Aqui está o resumo das suas atividades de hoje
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Badge
            variant={isDraggableMode ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            {isDraggableMode ? (
              <Layout className="h-3 w-3" />
            ) : (
              <LayoutDashboard className="h-3 w-3" />
            )}
            {isDraggableMode ? "Dashboard Customizável" : "Dashboard Padrão"}
          </Badge>

          <Button
            variant={isDraggableMode ? "default" : "outline"}
            onClick={() => setIsDraggableMode(!isDraggableMode)}
            className="flex items-center gap-2"
          >
            {isDraggableMode ? (
              <>
                <LayoutDashboard className="h-4 w-4" />
                Dashboard Padrão
              </>
            ) : (
              <>
                <Layout className="h-4 w-4" />
                Dashboard Customizável
              </>
            )}
          </Button>
        </div>
      </div>

      {isDraggableMode ? (
        <DraggableDashboard />
      ) : (
        <>
          {/* Cards de Estatísticas */}
          <div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            id="dashboard-stats"
          >
            {statsData.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>

          {/* Segunda linha - Gráfico e Calendário */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <BookingsChart data={chartData} />
            </div>
            <div className="lg:col-span-2">
              <MiniCalendar bookings={mockBookings} />
            </div>
          </div>

          {/* Terceira linha - Ações Rápidas e Notificações */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <QuickActions />
            <NotificationsWidget />
          </div>

          {/* Estatísticas adicionais por tipo de usuário */}
          {user?.role === "diretor" && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
              <StatsCard
                title="Usuários Ativos"
                value="145"
                description="12 novos este mês"
                icon={Users}
                trend={{ value: 8, isPositive: true }}
                color="blue"
              />
              <StatsCard
                title="Taxa de Utilização"
                value="89%"
                description="Média mensal"
                icon={Activity}
                trend={{ value: 3, isPositive: true }}
                color="green"
              />
              <StatsCard
                title="Equipamentos"
                value="42"
                description="3 novos adicionados"
                icon={Laptop}
                color="purple"
              />
              <StatsCard
                title="Espaços"
                value="15"
                description="Todos operacionais"
                icon={BookOpen}
                color="orange"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { StatsCard } from "@/components/dashboard/stats-card";
import { BookingsChart } from "@/components/dashboard/bookings-chart";
import { MiniCalendar } from "@/components/dashboard/mini-calendar";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { NotificationsWidget } from "@/components/dashboard/notifications-widget";
import {
  Settings,
  RotateCcw,
  Lock,
  Unlock,
  Move,
  Calendar,
  Package,
  TrendingUp,
  Clock,
  Users,
  Activity,
  Laptop,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { addDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardWidget {
  id: string;
  title: string;
  component: React.ReactNode;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export function DraggableDashboard() {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [layouts, setLayouts] = useState<any>({});

  // Dados mockados (mesmos do dashboard original)
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

  // Widgets adicionais para diretores
  const directorStats =
    user?.role === "diretor"
      ? [
          {
            title: "Usuários Ativos",
            value: "145",
            description: "12 novos este mês",
            icon: Users,
            trend: { value: 8, isPositive: true },
            color: "blue" as const,
          },
          {
            title: "Taxa de Utilização",
            value: "89%",
            description: "Média mensal",
            icon: Activity,
            trend: { value: 3, isPositive: true },
            color: "green" as const,
          },
          {
            title: "Equipamentos",
            value: "42",
            description: "3 novos adicionados",
            icon: Laptop,
            color: "purple" as const,
          },
          {
            title: "Espaços",
            value: "15",
            description: "Todos operacionais",
            icon: BookOpen,
            color: "orange" as const,
          },
        ]
      : [];

  // Definição dos widgets
  const widgets: DashboardWidget[] = [
    ...statsData.map((stat, index) => ({
      id: `stat-${index}`,
      title: stat.title,
      component: <StatsCard {...stat} />,
      minW: 1,
      minH: 1,
      maxW: 2,
      maxH: 1,
    })),
    {
      id: "chart",
      title: "Gráfico de Agendamentos",
      component: <BookingsChart data={chartData} />,
      minW: 3,
      minH: 2,
      maxW: 5,
      maxH: 3,
    },
    {
      id: "calendar",
      title: "Mini Calendário",
      component: <MiniCalendar bookings={mockBookings} />,
      minW: 2,
      minH: 2,
      maxW: 3,
      maxH: 3,
    },
    {
      id: "actions",
      title: "Ações Rápidas",
      component: <QuickActions />,
      minW: 2,
      minH: 2,
      maxW: 4,
      maxH: 2,
    },
    {
      id: "notifications",
      title: "Notificações",
      component: <NotificationsWidget />,
      minW: 2,
      minH: 2,
      maxW: 3,
      maxH: 4,
    },
    ...directorStats.map((stat, index) => ({
      id: `director-stat-${index}`,
      title: stat.title,
      component: <StatsCard {...stat} />,
      minW: 1,
      minH: 1,
      maxW: 2,
      maxH: 1,
    })),
  ];

  // Layout padrão
  const defaultLayout = [
    // Primeira linha - Stats principais
    { i: "stat-0", x: 0, y: 0, w: 1, h: 1 },
    { i: "stat-1", x: 1, y: 0, w: 1, h: 1 },
    { i: "stat-2", x: 2, y: 0, w: 1, h: 1 },
    { i: "stat-3", x: 3, y: 0, w: 1, h: 1 },

    // Segunda linha - Gráfico e Calendário
    { i: "chart", x: 0, y: 1, w: 5, h: 2 },
    { i: "calendar", x: 5, y: 1, w: 2, h: 2 },

    // Terceira linha - Ações e Notificações
    { i: "actions", x: 0, y: 3, w: 4, h: 2 },
    { i: "notifications", x: 4, y: 3, w: 3, h: 2 },

    // Stats adicionais para diretores (se existirem)
    ...directorStats.map((_, index) => ({
      i: `director-stat-${index}`,
      x: index,
      y: 5,
      w: 1,
      h: 1,
    })),
  ];

  // Carregar layout salvo do localStorage
  useEffect(() => {
    const savedLayouts = localStorage.getItem("dashboard-layouts");
    if (savedLayouts) {
      setLayouts(JSON.parse(savedLayouts));
    } else {
      setLayouts({ lg: defaultLayout });
    }
  }, []);

  // Salvar layout no localStorage
  const onLayoutChange = (layout: Layout[], layouts: any) => {
    setLayouts(layouts);
    localStorage.setItem("dashboard-layouts", JSON.stringify(layouts));
  };

  // Reset para layout padrão
  const resetLayout = () => {
    const newLayouts = { lg: defaultLayout };
    setLayouts(newLayouts);
    localStorage.setItem("dashboard-layouts", JSON.stringify(newLayouts));
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Cabeçalho com controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Olá, {user?.name?.split(" ")[0]}! 👋
          </h2>
          <p className="text-muted-foreground">
            Dashboard customizável - organize os widgets como preferir
          </p>
        </div>

        <div className="flex items-center gap-4">
          <AnimatePresence>
            {isEditMode && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2"
              >
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Move className="h-3 w-3" />
                  Modo Edição
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetLayout}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2">
            <label htmlFor="edit-mode" className="text-sm font-medium">
              {isEditMode ? (
                <Unlock className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
            </label>
            <Switch
              id="edit-mode"
              checked={isEditMode}
              onCheckedChange={setIsEditMode}
            />
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div
        className={`${
          isEditMode
            ? "border-2 border-dashed border-primary/30 rounded-lg p-2"
            : ""
        }`}
      >
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          onLayoutChange={onLayoutChange}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 7, md: 6, sm: 4, xs: 2, xxs: 1 }}
          rowHeight={100}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          useCSSTransforms={true}
        >
          {widgets.map((widget) => (
            <div key={widget.id} className="relative">
              <Card
                className={`h-full ${
                  isEditMode
                    ? "cursor-move hover:shadow-lg transition-shadow"
                    : ""
                }`}
              >
                <CardContent className="p-0 h-full">
                  {widget.component}
                </CardContent>
              </Card>

              {isEditMode && (
                <div className="absolute top-2 right-2 opacity-50 hover:opacity-100 transition-opacity">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>

      {/* Instruções para novos usuários */}
      {isEditMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border border-primary/20 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 text-primary font-medium mb-2">
            <Move className="h-4 w-4" />
            Modo de Edição Ativo
          </div>
          <p className="text-sm text-muted-foreground">
            Arraste os widgets para reorganizar seu dashboard. Redimensione
            clicando e arrastando as bordas. Use o botão "Reset" para voltar ao
            layout original.
          </p>
        </motion.div>
      )}
    </div>
  );
}

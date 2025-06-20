"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  Calendar,
  Users,
  Package,
  Wrench,
  TrendingUp,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { format, subMonths } from "date-fns";

interface AdvancedReportsProps {
  className?: string;
}

interface ReportData {
  summary?: {
    totalBookings: number;
    totalResources: number;
    totalUsers: number;
    totalMaintenance: number;
  };
  bookingsByStatus?: Array<{
    status: string;
    count: number;
    label: string;
  }>;
  topResources?: Array<{
    resourceId: string;
    name: string;
    _count: number;
  }>;
  monthlyData?: Array<{
    month: string;
    count: number;
    label: string;
  }>;
  resourceData?: Array<{
    resourceId: string;
    name: string;
    totalBookings: number;
  }>;
  weekdayData?: Array<{
    day: string;
    count: number;
  }>;
  hourlyData?: Array<{
    hour: number;
    count: number;
    label: string;
  }>;
  resourceStats?: any[];
  resourcesByCategory?: any[];
  resourcesByStatus?: any[];
  maintenanceStats?: any[];
  maintenanceByType?: any[];
  maintenanceByStatus?: any[];
  usersByRole?: any[];
  topUsers?: any[];
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

export function AdvancedReports({ className = "" }: AdvancedReportsProps) {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData>({});
  const [filters, setFilters] = useState({
    reportType: "overview",
    startDate: format(subMonths(new Date(), 6), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    resourceId: "",
  });

  // Carregar dados do relatório
  const loadReportData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: filters.reportType,
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.resourceId && { resourceId: filters.resourceId }),
      });

      const response = await fetch(`/api/reports?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao carregar relatório");
      }
    } catch (error) {
      toast.error("Erro ao carregar relatório");
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadReportData();
  }, []);

  // Recarregar quando o tipo de relatório mudar
  useEffect(() => {
    loadReportData();
  }, [filters.reportType]);

  // Atualizar relatório quando filtros mudarem
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    loadReportData();
  };

  // Exportar relatório
  const exportReport = async (exportFormat: "pdf" | "excel" = "pdf") => {
    try {
      setLoading(true);

      // Criar dados para exportação
      const exportData = {
        title: `Relatório ${filters.reportType}`,
        period: `${filters.startDate} a ${filters.endDate}`,
        generatedAt: new Date().toISOString(),
        data: reportData,
        filters: filters,
      };

      // Criar e baixar arquivo JSON
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio-${filters.reportType}-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast.error("Erro ao exportar relatório");
    } finally {
      setLoading(false);
    }
  };

  // Handler para o botão de exportar
  const handleExportClick = () => {
    exportReport("pdf");
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Relatórios Avançados
          </h2>
          <p className="text-muted-foreground">
            Análises detalhadas e insights do sistema
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleExportClick} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={loadReportData} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Tipo de Relatório</Label>
              <Select
                value={filters.reportType}
                onValueChange={(value) =>
                  handleFilterChange("reportType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Visão Geral</SelectItem>
                  <SelectItem value="usage">Uso Detalhado</SelectItem>
                  <SelectItem value="resources">Recursos</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                  <SelectItem value="users">Usuários</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
              />
            </div>
            <div>
              <Label>Data Final</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={applyFilters}
                disabled={loading}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo dos Relatórios */}
      <Tabs
        value={filters.reportType}
        onValueChange={(value) => handleFilterChange("reportType", value)}
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="usage">Uso</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {/* Cards de Resumo */}
          {reportData.summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {reportData.summary.totalBookings}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Agendamentos
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Package className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {reportData.summary.totalResources}
                      </p>
                      <p className="text-sm text-muted-foreground">Recursos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {reportData.summary.totalUsers}
                      </p>
                      <p className="text-sm text-muted-foreground">Usuários</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Wrench className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {reportData.summary.totalMaintenance}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Manutenções
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status dos Agendamentos */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Carregando dados...
                  </div>
                ) : reportData.bookingsByStatus &&
                  reportData.bookingsByStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.bookingsByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ label, percent }) =>
                          `${label} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {reportData.bookingsByStatus.map(
                          (entry: any, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Nenhum dado disponível para o período selecionado
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recursos Mais Utilizados */}
            <Card>
              <CardHeader>
                <CardTitle>Recursos Mais Utilizados</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Carregando dados...
                  </div>
                ) : reportData.topResources &&
                  reportData.topResources.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.topResources}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="_count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Nenhum dado disponível para o período selecionado
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Uso Detalhado */}
        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Total de Agendamentos por Recurso */}
            <Card>
              <CardHeader>
                <CardTitle>Total de Agendamentos por Recurso</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Carregando dados...
                  </div>
                ) : reportData.resourceData &&
                  reportData.resourceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.resourceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="totalBookings" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Nenhum dado disponível para o período selecionado
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Agendamentos por Dia da Semana */}
            <Card>
              <CardHeader>
                <CardTitle>Agendamentos por Dia da Semana</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Carregando dados...
                  </div>
                ) : reportData.weekdayData &&
                  reportData.weekdayData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.weekdayData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Nenhum dado disponível para o período selecionado
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Agendamentos por Hora */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Distribuição por Horário</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Carregando dados...
                  </div>
                ) : reportData.hourlyData &&
                  reportData.hourlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={reportData.hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#8884d8"
                        fill="#8884d8"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Nenhum dado disponível para o período selecionado
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recursos */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recursos por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Recursos por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Carregando dados...
                  </div>
                ) : reportData.resourcesByCategory &&
                  reportData.resourcesByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.resourcesByCategory}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="_count"
                        label={({ category, percent }) =>
                          `${category} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {reportData.resourcesByCategory.map(
                          (entry: any, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Nenhum dado disponível para o período selecionado
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recursos por Status */}
            <Card>
              <CardHeader>
                <CardTitle>Recursos por Status</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Carregando dados...
                  </div>
                ) : reportData.resourcesByStatus &&
                  reportData.resourcesByStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.resourcesByStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="_count" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Nenhum dado disponível para o período selecionado
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Manutenção */}
        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Manutenção por Tipo */}
            <Card>
              <CardHeader>
                <CardTitle>Manutenção por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Carregando dados...
                  </div>
                ) : reportData.maintenanceByType &&
                  reportData.maintenanceByType.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.maintenanceByType}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="_count"
                        label={({ type, percent }) =>
                          `${type} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {reportData.maintenanceByType.map(
                          (entry: any, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Nenhum dado disponível para o período selecionado
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Manutenção por Status */}
            <Card>
              <CardHeader>
                <CardTitle>Manutenção por Status</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Carregando dados...
                  </div>
                ) : reportData.maintenanceByStatus &&
                  reportData.maintenanceByStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.maintenanceByStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="_count" fill="#ff7300" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Nenhum dado disponível para o período selecionado
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Usuários */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usuários por Papel */}
            <Card>
              <CardHeader>
                <CardTitle>Usuários por Papel</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Carregando dados...
                  </div>
                ) : reportData.usersByRole &&
                  reportData.usersByRole.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.usersByRole}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="_count"
                        label={({ role, percent }) =>
                          `${role} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {reportData.usersByRole.map(
                          (entry: any, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Nenhum dado disponível para o período selecionado
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usuários Mais Ativos */}
            <Card>
              <CardHeader>
                <CardTitle>Usuários Mais Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Carregando dados...
                  </div>
                ) : reportData.topUsers && reportData.topUsers.length > 0 ? (
                  <div className="space-y-3">
                    {reportData.topUsers
                      .slice(0, 5)
                      .map((user: any, index: number) => (
                        <div
                          key={user.userId}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">{index + 1}</Badge>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {user.role}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {user._count} agendamentos
                          </Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Nenhum usuário ativo encontrado para o período selecionado
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

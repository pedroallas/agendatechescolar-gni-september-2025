"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { Download } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { AdvancedReports } from "@/components/advanced-reports";

// Registrar os componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function ReportsPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [resourceType, setResourceType] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // Dados fictícios para os gráficos
  const usageByDayData = {
    labels: [
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
      "Domingo",
    ],
    datasets: [
      {
        label: "Agendamentos",
        data: [12, 19, 15, 17, 14, 8, 4],
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.5)",
      },
    ],
  };

  const resourceUsageData = {
    labels: [
      "Data Show",
      "TV",
      "Chromebooks",
      "Caixas de Som",
      "Laboratório",
      "Biblioteca",
    ],
    datasets: [
      {
        label: "Total de Agendamentos",
        data: [32, 19, 25, 12, 35, 18],
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const timeBlockUsageData = {
    labels: [
      "07:30 - 08:20",
      "08:20 - 09:10",
      "09:30 - 10:20",
      "10:20 - 11:10",
      "11:10 - 12:00",
      "13:20 - 14:10",
      "14:10 - 15:00",
      "15:30 - 16:15",
      "16:15 - 17:00",
    ],
    datasets: [
      {
        label: "Agendamentos por Horário",
        data: [8, 12, 15, 18, 14, 16, 10, 9, 7],
        backgroundColor: "rgba(153, 102, 255, 0.5)",
      },
    ],
  };

  const userTypeUsageData = {
    labels: ["Professores", "Coordenadores", "Diretores", "Funcionários"],
    datasets: [
      {
        label: "Agendamentos por Tipo de Usuário",
        data: [65, 15, 5, 15],
        backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0"],
        hoverOffset: 4,
      },
    ],
  };

  const exportReport = (type: string) => {
    // Em uma implementação real, isso geraria um arquivo CSV ou PDF
    alert(
      `Exportação de relatório ${type} não implementada nesta versão de demonstração.`
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">
          Análises avançadas e insights do sistema de agendamento
        </p>
      </div>

      <AdvancedReports />
    </div>
  );
}

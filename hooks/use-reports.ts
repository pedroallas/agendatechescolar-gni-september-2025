import { useState, useCallback } from "react";
import { toast } from "sonner";
import { format, subMonths } from "date-fns";

interface ReportFilters {
  reportType: string;
  startDate: string;
  endDate: string;
  resourceId: string;
}

interface UseReportsReturn {
  loading: boolean;
  reportData: any;
  filters: ReportFilters;
  loadReportData: () => Promise<void>;
  updateFilter: (key: keyof ReportFilters, value: string) => void;
  exportReport: (format?: "pdf" | "excel") => Promise<void>;
  resetFilters: () => void;
}

export function useReports(): UseReportsReturn {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>({});
  const [filters, setFilters] = useState<ReportFilters>({
    reportType: "overview",
    startDate: format(subMonths(new Date(), 6), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    resourceId: "",
  });

  // Carregar dados do relatório
  const loadReportData = useCallback(async () => {
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
      console.error("Erro ao carregar relatório:", error);
      toast.error("Erro ao carregar relatório");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Atualizar filtro
  const updateFilter = useCallback(
    (key: keyof ReportFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Exportar relatório
  const exportReport = useCallback(
    async (exportFormat: "pdf" | "excel" = "pdf") => {
      try {
        const response = await fetch("/api/reports/export", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: filters.reportType,
            format: exportFormat,
            startDate: filters.startDate,
            endDate: filters.endDate,
            ...(filters.resourceId && { resourceId: filters.resourceId }),
          }),
        });

        if (response.ok) {
          const result = await response.json();
          toast.success("Relatório exportado com sucesso!");

          // Criar e baixar arquivo JSON temporariamente
          const dataStr = JSON.stringify(result, null, 2);
          const dataBlob = new Blob([dataStr], { type: "application/json" });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `relatorio-${filters.reportType}-${format(
            new Date(),
            "yyyy-MM-dd"
          )}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else {
          const error = await response.json();
          toast.error(error.error || "Erro ao exportar relatório");
        }
      } catch (error) {
        console.error("Erro ao exportar relatório:", error);
        toast.error("Erro ao exportar relatório");
      }
    },
    [filters]
  );

  // Resetar filtros
  const resetFilters = useCallback(() => {
    setFilters({
      reportType: "overview",
      startDate: format(subMonths(new Date(), 6), "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
      resourceId: "",
    });
  }, []);

  return {
    loading,
    reportData,
    filters,
    loadReportData,
    updateFilter,
    exportReport,
    resetFilters,
  };
}

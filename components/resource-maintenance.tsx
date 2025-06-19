"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Wrench,
  Plus,
  Calendar,
  Clock,
  User,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Edit,
  Trash2,
  TrendingUp,
  BarChart3,
} from "lucide-react";

interface MaintenanceRecord {
  id: string;
  type: string;
  priority: string;
  status: string;
  description: string;
  solution?: string;
  performedBy?: string;
  reportedAt: string;
  scheduledDate?: string;
  startedAt?: string;
  resolvedAt?: string;
  nextService?: string;
  estimatedCost?: number;
  actualCost?: number;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

interface MaintenanceStats {
  totalRecords: number;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
  averageResolutionDays: number;
}

interface ResourceMaintenanceProps {
  resourceId: string;
  resourceName: string;
  isAdmin?: boolean;
  className?: string;
}

export function ResourceMaintenance({
  resourceId,
  resourceName,
  isAdmin = false,
  className = "",
}: ResourceMaintenanceProps) {
  const { data: session } = useSession();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [stats, setStats] = useState<MaintenanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [addRecordOpen, setAddRecordOpen] = useState(false);
  const [editRecordOpen, setEditRecordOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<MaintenanceRecord | null>(null);

  // Form states for new record
  const [newType, setNewType] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newScheduledDate, setNewScheduledDate] = useState("");
  const [newEstimatedCost, setNewEstimatedCost] = useState("");

  // Form states for editing
  const [editStatus, setEditStatus] = useState("");
  const [editSolution, setEditSolution] = useState("");
  const [editPerformedBy, setEditPerformedBy] = useState("");
  const [editActualCost, setEditActualCost] = useState("");
  const [editNextService, setEditNextService] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Carregar registros de manutenção
  const loadMaintenanceRecords = async () => {
    try {
      const response = await fetch(`/api/resources/${resourceId}/maintenance`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Erro ao carregar registros de manutenção:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaintenanceRecords();
  }, [resourceId]);

  // Adicionar novo registro
  const handleAddRecord = async () => {
    if (!newType || !newPriority || !newDescription.trim()) {
      toast.error("Tipo, prioridade e descrição são obrigatórios");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/resources/${resourceId}/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newType,
          priority: newPriority,
          description: newDescription.trim(),
          scheduledDate: newScheduledDate || undefined,
          estimatedCost: newEstimatedCost
            ? parseFloat(newEstimatedCost)
            : undefined,
        }),
      });

      if (response.ok) {
        toast.success("Registro de manutenção criado com sucesso!");
        setAddRecordOpen(false);
        resetNewForm();
        await loadMaintenanceRecords();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao criar registro");
      }
    } catch (error) {
      toast.error("Erro ao criar registro de manutenção");
    } finally {
      setSubmitting(false);
    }
  };

  // Atualizar registro
  const handleUpdateRecord = async () => {
    if (!selectedRecord) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        `/api/resources/${resourceId}/maintenance/${selectedRecord.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: editStatus || undefined,
            solution: editSolution.trim() || undefined,
            performedBy: editPerformedBy.trim() || undefined,
            actualCost: editActualCost ? parseFloat(editActualCost) : undefined,
            nextService: editNextService || undefined,
          }),
        }
      );

      if (response.ok) {
        toast.success("Registro atualizado com sucesso!");
        setEditRecordOpen(false);
        setSelectedRecord(null);
        await loadMaintenanceRecords();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao atualizar registro");
      }
    } catch (error) {
      toast.error("Erro ao atualizar registro");
    } finally {
      setSubmitting(false);
    }
  };

  // Deletar registro
  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("Tem certeza que deseja remover este registro?")) return;

    try {
      const response = await fetch(
        `/api/resources/${resourceId}/maintenance/${recordId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Registro removido com sucesso!");
        await loadMaintenanceRecords();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao remover registro");
      }
    } catch (error) {
      toast.error("Erro ao remover registro");
    }
  };

  // Abrir edição
  const openEditRecord = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setEditStatus(record.status);
    setEditSolution(record.solution || "");
    setEditPerformedBy(record.performedBy || "");
    setEditActualCost(record.actualCost?.toString() || "");
    setEditNextService(
      record.nextService ? record.nextService.split("T")[0] : ""
    );
    setEditRecordOpen(true);
  };

  // Reset form
  const resetNewForm = () => {
    setNewType("");
    setNewPriority("");
    setNewDescription("");
    setNewScheduledDate("");
    setNewEstimatedCost("");
  };

  // Helper functions
  const getTypeText = (type: string) => {
    switch (type) {
      case "preventive":
        return "Preventiva";
      case "corrective":
        return "Corretiva";
      case "emergency":
        return "Emergência";
      default:
        return type;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Urgente";
      case "high":
        return "Alta";
      case "medium":
        return "Média";
      case "low":
        return "Baixa";
      default:
        return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "in_progress":
        return "Em Andamento";
      case "completed":
        return "Concluído";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
        return <Play className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              <span>Histórico de Manutenção ({stats?.totalRecords || 0})</span>
            </div>
            {session?.user && isAdmin && (
              <Dialog open={addRecordOpen} onOpenChange={setAddRecordOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Reportar Manutenção
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      Reportar Manutenção - {resourceName}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Tipo de Manutenção</Label>
                      <Select value={newType} onValueChange={setNewType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="preventive">Preventiva</SelectItem>
                          <SelectItem value="corrective">Corretiva</SelectItem>
                          <SelectItem value="emergency">Emergência</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Prioridade</Label>
                      <Select
                        value={newPriority}
                        onValueChange={setNewPriority}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição do Problema</Label>
                      <Textarea
                        id="description"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Descreva o problema ou necessidade de manutenção..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="scheduledDate">
                        Data Sugerida (opcional)
                      </Label>
                      <Input
                        id="scheduledDate"
                        type="date"
                        value={newScheduledDate}
                        onChange={(e) => setNewScheduledDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="estimatedCost">
                        Custo Estimado (opcional)
                      </Label>
                      <Input
                        id="estimatedCost"
                        type="number"
                        step="0.01"
                        value={newEstimatedCost}
                        onChange={(e) => setNewEstimatedCost(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setAddRecordOpen(false)}
                        disabled={submitting}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAddRecord}
                        disabled={
                          submitting ||
                          !newType ||
                          !newPriority ||
                          !newDescription.trim()
                        }
                      >
                        Criar Registro
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats && stats.totalRecords > 0 ? (
            <>
              {/* Estatísticas */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {stats.totalRecords}
                    </div>
                    <div className="text-sm text-gray-500">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {stats.pendingCount}
                    </div>
                    <div className="text-sm text-gray-500">Pendentes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.inProgressCount}
                    </div>
                    <div className="text-sm text-gray-500">Em Andamento</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.completedCount}
                    </div>
                    <div className="text-sm text-gray-500">Concluídos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.averageResolutionDays || 0}
                    </div>
                    <div className="text-sm text-gray-500">Dias (média)</div>
                  </div>
                </div>
              </div>

              {/* Lista de registros */}
              <div className="space-y-4">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(record.status)}
                          <Badge className={getStatusColor(record.status)}>
                            {getStatusText(record.status)}
                          </Badge>
                          <Badge className={getPriorityColor(record.priority)}>
                            {getPriorityText(record.priority)}
                          </Badge>
                          <Badge variant="outline">
                            {getTypeText(record.type)}
                          </Badge>
                        </div>
                        <p className="text-gray-700">{record.description}</p>
                        {record.solution && (
                          <div className="bg-green-50 p-2 rounded">
                            <p className="text-sm text-green-800">
                              <strong>Solução:</strong> {record.solution}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            <User className="h-3 w-3 inline mr-1" />
                            {record.user.name}
                          </span>
                          <span>
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {new Date(record.reportedAt).toLocaleDateString(
                              "pt-BR"
                            )}
                          </span>
                          {record.estimatedCost && (
                            <span>
                              <DollarSign className="h-3 w-3 inline mr-1" />
                              R$ {record.estimatedCost.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      {(isAdmin || record.user.id === session?.user?.id) && (
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditRecord(record)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRecord(record.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum registro de manutenção ainda</p>
              {session?.user && (
                <p className="text-sm mt-2">
                  Seja o primeiro a reportar uma manutenção!
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      {selectedRecord && (
        <Dialog open={editRecordOpen} onOpenChange={setEditRecordOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Atualizar Manutenção</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editSolution">Solução/Observações</Label>
                <Textarea
                  id="editSolution"
                  value={editSolution}
                  onChange={(e) => setEditSolution(e.target.value)}
                  placeholder="Descreva a solução aplicada..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="editPerformedBy">Executado por</Label>
                <Input
                  id="editPerformedBy"
                  value={editPerformedBy}
                  onChange={(e) => setEditPerformedBy(e.target.value)}
                  placeholder="Nome do responsável pela execução"
                />
              </div>
              <div>
                <Label htmlFor="editActualCost">Custo Real</Label>
                <Input
                  id="editActualCost"
                  type="number"
                  step="0.01"
                  value={editActualCost}
                  onChange={(e) => setEditActualCost(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="editNextService">Próxima Manutenção</Label>
                <Input
                  id="editNextService"
                  type="date"
                  value={editNextService}
                  onChange={(e) => setEditNextService(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setEditRecordOpen(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button onClick={handleUpdateRecord} disabled={submitting}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

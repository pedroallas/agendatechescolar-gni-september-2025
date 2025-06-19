"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Repeat } from "lucide-react";

interface RecurringPattern {
  type: "daily" | "weekly" | "monthly";
  interval: number;
  endDate?: string;
  daysOfWeek?: number[];
}

interface RecurringBookingFormProps {
  isRecurring: boolean;
  pattern: RecurringPattern;
  onRecurringChange: (isRecurring: boolean) => void;
  onPatternChange: (pattern: RecurringPattern) => void;
  currentDate: string;
  errors?: Record<string, string>;
}

export function RecurringBookingForm({
  isRecurring,
  pattern,
  onRecurringChange,
  onPatternChange,
  currentDate,
  errors = {},
}: RecurringBookingFormProps) {
  const updatePattern = (updates: Partial<RecurringPattern>) => {
    onPatternChange({ ...pattern, ...updates });
  };

  const handleDayToggle = (dayIndex: number, checked: boolean) => {
    const newDays = checked
      ? [...(pattern.daysOfWeek || []), dayIndex]
      : (pattern.daysOfWeek || []).filter((d) => d !== dayIndex);

    updatePattern({ daysOfWeek: newDays.sort() });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isRecurring"
          checked={isRecurring}
          onCheckedChange={onRecurringChange}
        />
        <Label htmlFor="isRecurring" className="flex items-center gap-2">
          <Repeat className="h-4 w-4" />
          Agendamento Recorrente
        </Label>
      </div>

      {isRecurring && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-medium flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            Configurações de Recorrência
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recurringType">Tipo de Recorrência</Label>
              <Select
                value={pattern.type}
                onValueChange={(value: "daily" | "weekly" | "monthly") =>
                  updatePattern({ type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diariamente</SelectItem>
                  <SelectItem value="weekly">Semanalmente</SelectItem>
                  <SelectItem value="monthly">Mensalmente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="recurringInterval">
                Intervalo (
                {pattern.type === "daily"
                  ? "dias"
                  : pattern.type === "weekly"
                  ? "semanas"
                  : "meses"}
                )
              </Label>
              <Input
                type="number"
                min="1"
                max="12"
                value={pattern.interval}
                onChange={(e) =>
                  updatePattern({ interval: parseInt(e.target.value) || 1 })
                }
                placeholder="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                {pattern.type === "daily" &&
                  `A cada ${pattern.interval} dia(s)`}
                {pattern.type === "weekly" &&
                  `A cada ${pattern.interval} semana(s)`}
                {pattern.type === "monthly" &&
                  `A cada ${pattern.interval} mês(es)`}
              </p>
            </div>
          </div>

          {pattern.type === "weekly" && (
            <div>
              <Label>Dias da Semana</Label>
              <div className="grid grid-cols-7 gap-2 mt-2">
                {[
                  { name: "Dom", index: 0 },
                  { name: "Seg", index: 1 },
                  { name: "Ter", index: 2 },
                  { name: "Qua", index: 3 },
                  { name: "Qui", index: 4 },
                  { name: "Sex", index: 5 },
                  { name: "Sáb", index: 6 },
                ].map((day) => (
                  <div
                    key={day.index}
                    className="flex flex-col items-center space-y-1"
                  >
                    <Checkbox
                      id={`day-${day.index}`}
                      checked={(pattern.daysOfWeek || []).includes(day.index)}
                      onCheckedChange={(checked) =>
                        handleDayToggle(day.index, checked as boolean)
                      }
                    />
                    <Label htmlFor={`day-${day.index}`} className="text-xs">
                      {day.name}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.recurringDaysOfWeek && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.recurringDaysOfWeek}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Selecione os dias da semana para o agendamento recorrente
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="recurringEndDate">Data Final da Recorrência</Label>
            <Input
              type="date"
              value={pattern.endDate || ""}
              onChange={(e) => updatePattern({ endDate: e.target.value })}
              min={currentDate}
            />
            {errors.recurringEndDate && (
              <p className="text-sm text-red-600 mt-1">
                {errors.recurringEndDate}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Deixe em branco para recorrência indefinida
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <h5 className="font-medium text-blue-900 mb-1">
              Resumo da Recorrência:
            </h5>
            <p className="text-sm text-blue-800">
              {pattern.type === "daily" &&
                `Agendamento todos os dias, a cada ${pattern.interval} dia(s)`}
              {pattern.type === "weekly" &&
                `Agendamento todas as semanas, a cada ${
                  pattern.interval
                } semana(s)${
                  pattern.daysOfWeek?.length
                    ? ` nos dias: ${pattern.daysOfWeek
                        .map(
                          (d) =>
                            ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d]
                        )
                        .join(", ")}`
                    : " (selecione os dias da semana)"
                }`}
              {pattern.type === "monthly" &&
                `Agendamento todos os meses, a cada ${pattern.interval} mês(es)`}
              {pattern.endDate &&
                ` até ${new Date(pattern.endDate).toLocaleDateString("pt-BR")}`}
              {!pattern.endDate && " (sem data final)"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

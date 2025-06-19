"use client";

import { useCallback } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";

interface Booking {
  id: string;
  resourceId: string;
  userId: string;
  timeBlockId: string;
  date: string;
  purpose: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  user: {
    name: string;
    email: string;
    role: string;
  };
}

interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
  shift: string;
}

interface SmartSuggestion {
  timeBlockId: string;
  resourceId: string;
  date: string;
  reason: string;
  confidence: number;
}

interface SmartSuggestionsProps {
  suggestions: SmartSuggestion[];
  timeBlocks: TimeBlock[];
  onSuggestionSelect: (suggestion: SmartSuggestion) => void;
  onClose: () => void;
}

export function SmartSuggestions({
  suggestions,
  timeBlocks,
  onSuggestionSelect,
  onClose,
}: SmartSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium text-blue-900">Sugestões Inteligentes</h3>
        </div>
        <button
          onClick={onClose}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Fechar
        </button>
      </div>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => {
          const timeBlock = timeBlocks.find(
            (tb) => tb.id === suggestion.timeBlockId
          );
          return (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-white rounded border cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => {
                onSuggestionSelect(suggestion);
                onClose();
              }}
            >
              <div>
                <div className="font-medium text-sm">
                  {timeBlock?.label} ({timeBlock?.startTime} -{" "}
                  {timeBlock?.endTime})
                </div>
                <div className="text-xs text-gray-600">{suggestion.reason}</div>
              </div>
              <Badge variant="secondary" className="text-xs">
                {suggestion.confidence.toFixed(0)}% match
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Smart Suggestions Algorithm Hook
export function useSmartSuggestions(
  bookings: Booking[],
  timeBlocks: TimeBlock[],
  userId?: string
) {
  const generateSuggestions = useCallback(
    (resourceId: string, preferredDate: Date) => {
      const suggestions: SmartSuggestion[] = [];
      const dateStr = format(preferredDate, "yyyy-MM-dd");

      // Get available time blocks for this date and resource
      const availableTimeBlocks = timeBlocks.filter((tb) => {
        return !bookings.some(
          (b) =>
            b.resourceId === resourceId &&
            b.timeBlockId === tb.id &&
            b.date === dateStr &&
            b.status !== "cancelled"
        );
      });

      if (availableTimeBlocks.length === 0) return suggestions;

      // Algorithm 1: User's historical time preferences
      const userBookings = bookings.filter((b) => b.userId === userId);
      const timeBlockFrequency = userBookings.reduce((acc, booking) => {
        acc[booking.timeBlockId] = (acc[booking.timeBlockId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      availableTimeBlocks.forEach((timeBlock) => {
        const frequency = timeBlockFrequency[timeBlock.id] || 0;
        const confidence =
          userBookings.length > 0 ? (frequency / userBookings.length) * 100 : 0;

        if (confidence > 15) {
          suggestions.push({
            timeBlockId: timeBlock.id,
            resourceId,
            date: dateStr,
            reason: `Você costuma agendar neste horário (${confidence.toFixed(
              0
            )}% das vezes)`,
            confidence: confidence,
          });
        }
      });

      // Algorithm 2: Low-usage time slots (better availability)
      const timeBlockUsage = bookings.reduce((acc, booking) => {
        if (booking.status !== "cancelled") {
          acc[booking.timeBlockId] = (acc[booking.timeBlockId] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const totalBookings = bookings.filter(
        (b) => b.status !== "cancelled"
      ).length;

      availableTimeBlocks.forEach((timeBlock) => {
        const usage = timeBlockUsage[timeBlock.id] || 0;
        const usageRate = totalBookings > 0 ? (usage / totalBookings) * 100 : 0;

        if (usageRate < 40) {
          suggestions.push({
            timeBlockId: timeBlock.id,
            resourceId,
            date: dateStr,
            reason: `Horário com baixa demanda (${usageRate.toFixed(
              0
            )}% de ocupação geral)`,
            confidence: 100 - usageRate,
          });
        }
      });

      // Algorithm 3: Adjacent time slots for longer activities
      for (let i = 0; i < availableTimeBlocks.length - 1; i++) {
        const currentBlock = availableTimeBlocks[i];
        const nextBlock = availableTimeBlocks[i + 1];

        if (currentBlock.endTime === nextBlock.startTime) {
          suggestions.push({
            timeBlockId: currentBlock.id,
            resourceId,
            date: dateStr,
            reason:
              "Horário consecutivo disponível - ideal para atividades longas",
            confidence: 85,
          });
        }
      }

      // Algorithm 4: Morning vs afternoon preference based on user history
      const morningBookings = userBookings.filter((b) => {
        const timeBlock = timeBlocks.find((tb) => tb.id === b.timeBlockId);
        return timeBlock?.shift === "morning";
      }).length;

      const afternoonBookings = userBookings.filter((b) => {
        const timeBlock = timeBlocks.find((tb) => tb.id === b.timeBlockId);
        return timeBlock?.shift === "afternoon";
      }).length;

      const morningPreference = morningBookings > afternoonBookings;
      const shiftConfidence =
        (Math.abs(morningBookings - afternoonBookings) /
          (morningBookings + afternoonBookings || 1)) *
        100;

      if (shiftConfidence > 20) {
        const preferredShift = morningPreference ? "morning" : "afternoon";
        const shiftName = morningPreference ? "manhã" : "tarde";

        availableTimeBlocks
          .filter((tb) => tb.shift === preferredShift)
          .forEach((timeBlock) => {
            suggestions.push({
              timeBlockId: timeBlock.id,
              resourceId,
              date: dateStr,
              reason: `Você prefere horários da ${shiftName} (${shiftConfidence.toFixed(
                0
              )}% de preferência)`,
              confidence: shiftConfidence,
            });
          });
      }

      // Remove duplicates and sort by confidence
      const uniqueSuggestions = suggestions.reduce((acc, current) => {
        const exists = acc.find((s) => s.timeBlockId === current.timeBlockId);
        if (!exists || current.confidence > exists.confidence) {
          return [
            ...acc.filter((s) => s.timeBlockId !== current.timeBlockId),
            current,
          ];
        }
        return acc;
      }, [] as SmartSuggestion[]);

      return uniqueSuggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);
    },
    [bookings, timeBlocks, userId]
  );

  return { generateSuggestions };
}

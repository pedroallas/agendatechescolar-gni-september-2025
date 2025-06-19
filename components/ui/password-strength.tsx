"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import zxcvbn from "zxcvbn";
import { Info } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
  showFeedback?: boolean;
}

export function PasswordStrength({
  password,
  showFeedback = true,
}: PasswordStrengthProps) {
  const [strength, setStrength] = useState<number>(0);
  const [feedback, setFeedback] = useState<string[]>([]);

  useEffect(() => {
    if (password) {
      const result = zxcvbn(password);
      setStrength(result.score);
      setFeedback(result.feedback.suggestions || []);
    } else {
      setStrength(0);
      setFeedback([]);
    }
  }, [password]);

  const strengthLabels = [
    "Muito fraca",
    "Fraca",
    "Razoável",
    "Boa",
    "Excelente",
  ];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ];

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              index <= strength ? strengthColors[strength] : "bg-gray-200"
            )}
          />
        ))}
      </div>

      {password && (
        <div className="flex items-center gap-2 text-sm">
          <span
            className={cn(
              "font-medium",
              strength === 0 && "text-red-500",
              strength === 1 && "text-orange-500",
              strength === 2 && "text-yellow-600",
              strength === 3 && "text-blue-500",
              strength === 4 && "text-green-500"
            )}
          >
            {strengthLabels[strength]}
          </span>
        </div>
      )}

      {showFeedback && feedback.length > 0 && (
        <div className="space-y-1 text-xs text-gray-600">
          {feedback.map((tip, index) => (
            <div key={index} className="flex items-start gap-1">
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

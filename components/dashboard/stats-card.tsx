"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "purple" | "orange";
}

const colorClasses = {
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  green: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  purple:
    "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  orange:
    "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
};

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "blue",
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden min-h-[120px] sm:h-[120px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium leading-tight">
            {title}
          </CardTitle>
          <div
            className={cn(
              "rounded-lg p-1.5 sm:p-2 flex-shrink-0",
              colorClasses[color]
            )}
          >
            <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between px-4 sm:px-6 pb-4 sm:pb-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-xl sm:text-2xl font-bold"
          >
            {value}
          </motion.div>
          <div className="space-y-1">
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
            <div className="min-h-[16px] flex items-center">
              {trend ? (
                <div className="flex items-center">
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className={cn(
                      "text-xs font-medium",
                      trend.isPositive ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {trend.isPositive ? "+" : "-"}
                    {Math.abs(trend.value)}%
                  </motion.span>
                  <span className="text-xs text-muted-foreground ml-1 sm:ml-2 hidden sm:inline">
                    vs. último mês
                  </span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Próximo na agenda
                </span>
              )}
            </div>
          </div>
        </CardContent>
        {/* Elemento decorativo */}
        <div
          className={cn(
            "absolute -right-8 -bottom-8 h-24 w-24 rounded-full opacity-10",
            colorClasses[color].split(" ")[0]
          )}
        />
      </Card>
    </motion.div>
  );
}

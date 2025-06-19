"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

interface BookingsChartProps {
  data: Array<{
    name: string;
    equipamentos: number;
    espacos: number;
  }>;
}

export function BookingsChart({ data }: BookingsChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-[480px] flex flex-col">
        <CardHeader>
          <CardTitle>Agendamentos por Tipo</CardTitle>
          <CardDescription>
            Comparativo de agendamentos de equipamentos e espaços
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                className="text-xs"
                tick={{ fill: "currentColor" }}
              />
              <YAxis className="text-xs" tick={{ fill: "currentColor" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="rect"
                formatter={(value) => (
                  <span className="text-sm capitalize">{value}</span>
                )}
              />
              <Bar
                dataKey="equipamentos"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
              />
              <Bar
                dataKey="espacos"
                fill="hsl(var(--primary) / 0.6)"
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

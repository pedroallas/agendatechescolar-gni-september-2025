"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Plus, Calendar, FileText, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      title: "Novo Agendamento",
      description: "Reserve um recurso",
      icon: Plus,
      onClick: () => router.push("/dashboard/schedule"),
      color: "bg-blue-100 text-blue-600 hover:bg-blue-200",
    },
    {
      title: "Meus Agendamentos",
      description: "Ver suas reservas",
      icon: Calendar,
      onClick: () => router.push("/dashboard/my-bookings"),
      color: "bg-green-100 text-green-600 hover:bg-green-200",
    },
    {
      title: "Relatórios",
      description: "Análises e dados",
      icon: FileText,
      onClick: () => router.push("/dashboard/reports"),
      color: "bg-purple-100 text-purple-600 hover:bg-purple-200",
    },
    {
      title: "Configurações",
      description: "Preferências do sistema",
      icon: Settings,
      onClick: () => router.push("/dashboard/settings"),
      color: "bg-orange-100 text-orange-600 hover:bg-orange-200",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card className="h-[400px] flex flex-col">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse as funcionalidades mais usadas
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="grid grid-cols-2 gap-4 h-full">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                >
                  <Button
                    variant="outline"
                    className="h-auto flex flex-col items-center justify-center p-4 space-y-2 w-full hover:shadow-md transition-shadow"
                    onClick={action.onClick}
                  >
                    <div className={`p-3 rounded-lg ${action.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

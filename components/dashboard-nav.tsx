"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  LayoutDashboard,
  Settings,
  Package,
  ClipboardList,
  CheckCircle,
  BarChart3,
  HelpCircle,
  Bell,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface DashboardNavProps extends React.HTMLAttributes<HTMLElement> {
  items?: {
    href: string;
    title: string;
    icon: React.ReactNode;
  }[];
}

export function DashboardNav({
  className,
  items,
  ...props
}: DashboardNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Itens base para todos os usuários
  const baseItems = [
    {
      href: "/dashboard",
      title: "Dashboard",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/schedule",
      title: "Agendar",
      icon: <Calendar className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/my-bookings",
      title: "Meus Agendamentos",
      icon: <ClipboardList className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/resources",
      title: "Recursos",
      icon: <Package className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/notifications",
      title: "Notificações",
      icon: <Bell className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/messages",
      title: "Mensagens",
      icon: <MessageCircle className="mr-2 h-4 w-4" />,
    },
  ];

  // Itens apenas para administradores
  const adminItems = [
    {
      href: "/dashboard/pending-approvals",
      title: "Aprovações",
      icon: <CheckCircle className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/reports",
      title: "Relatórios",
      icon: <BarChart3 className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/support",
      title: "Suporte",
      icon: <HelpCircle className="mr-2 h-4 w-4" />,
    },
  ];

  // Itens apenas para professores
  const teacherItems = [
    {
      href: "/dashboard/support",
      title: "Suporte",
      icon: <HelpCircle className="mr-2 h-4 w-4" />,
    },
  ];

  // Item de configurações para todos
  const settingsItem = {
    href: "/dashboard/settings",
    title: "Configurações",
    icon: <Settings className="mr-2 h-4 w-4" />,
  };

  // Montar lista de itens baseado no papel do usuário
  const defaultItems = [
    ...baseItems,
    // Adicionar itens específicos baseado no papel do usuário
    ...(user?.role === "diretor" || user?.role === "coordenador"
      ? adminItems
      : teacherItems),
    settingsItem,
  ];

  const navItems = items || defaultItems;

  return (
    <nav className={cn("flex flex-col space-y-1 p-4", className)} {...props}>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant={pathname === item.href ? "secondary" : "ghost"}
            className="w-full justify-start"
          >
            {item.icon}
            {item.title}
          </Button>
        </Link>
      ))}
    </nav>
  );
}

"use client";

import type React from "react";
import { useState } from "react";
import { DashboardNav } from "@/components/dashboard-nav";
import { UserNav } from "@/components/user-nav";
import { Logo } from "@/components/logo";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {/* Menu Mobile */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Menu de Navegação</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <div className="px-4 mb-4">
                    <Logo href="/dashboard" />
                  </div>
                  <DashboardNav />
                </div>
              </SheetContent>
            </Sheet>

            <Logo href="/dashboard" />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationBell />
            <UserNav />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Desktop */}
        <div className="dashboard-nav hidden w-64 border-r md:block">
          <DashboardNav />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full w-full p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourcesList } from "@/components/resources-list";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function ResourcesPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const isAdmin = user?.role === "diretor" || user?.role === "coordenador";

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Recursos</h2>
        {isAdmin && (
          <Link href="/dashboard/resources/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Recurso
            </Button>
          </Link>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Input placeholder="Buscar recursos..." className="max-w-sm" />
      </div>
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
          <TabsTrigger value="spaces">Espaços</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <ResourcesList isAdmin={isAdmin} />
        </TabsContent>
        <TabsContent value="equipment" className="space-y-4">
          <ResourcesList type="equipment" isAdmin={isAdmin} />
        </TabsContent>
        <TabsContent value="spaces" className="space-y-4">
          <ResourcesList type="spaces" isAdmin={isAdmin} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

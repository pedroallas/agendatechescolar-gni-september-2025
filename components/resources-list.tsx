"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, Loader2, Star } from "lucide-react";
import { useResources } from "@/hooks/use-resources";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ResourceApprovalBadge } from "@/components/ui/resource-approval-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ResourcesListProps {
  type?: "all" | "equipment" | "spaces";
  isAdmin?: boolean;
}

export function ResourcesList({
  type = "all",
  isAdmin = false,
}: ResourcesListProps) {
  const { resources, isLoading, error } = useResources(
    type !== "all" ? type : undefined
  );
  const router = useRouter();
  const [deleteResourceId, setDeleteResourceId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (id: string) => {
    router.push(`/dashboard/resources/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/resources/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Falha ao excluir recurso");
      }

      // Redirecionar para atualizar a lista
      router.refresh();
    } catch (error) {
      console.error("Erro ao excluir recurso:", error);
    } finally {
      setIsDeleting(false);
      setDeleteResourceId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/15 text-destructive p-4 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Nenhum recurso encontrado.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <Card key={resource.id}>
            <CardHeader className="p-4">
              <div className="flex justify-between items-center">
                <CardTitle
                  className="text-lg cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() =>
                    router.push(`/dashboard/resources/${resource.id}`)
                  }
                >
                  {resource.name}
                </CardTitle>
                <Badge
                  variant={
                    resource.status === "available"
                      ? "default"
                      : resource.status === "maintenance"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {resource.status === "available"
                    ? "Disponível"
                    : resource.status === "maintenance"
                    ? "Em Manutenção"
                    : "Bloqueado"}
                </Badge>
              </div>
              <CardDescription>{resource.location}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="aspect-video overflow-hidden rounded-md">
                <img
                  src={
                    resource.imageUrl || "/placeholder.svg?height=100&width=200"
                  }
                  alt={resource.name}
                  className="h-full w-full object-cover"
                />
              </div>
              {resource.description && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {resource.description}
                </p>
              )}
              {resource.quantity && (
                <p className="mt-1 text-sm">
                  <span className="font-medium">Quantidade:</span>{" "}
                  {resource.quantity}
                </p>
              )}
              {resource.capacity && (
                <p className="mt-1 text-sm">
                  <span className="font-medium">Capacidade:</span>{" "}
                  {resource.capacity}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <ResourceApprovalBadge
                  requiresApproval={resource.requiresApproval}
                />
                {resource.averageRating && resource.averageRating > 0 && (
                  <div className="flex items-center space-x-1 text-sm">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">
                      {resource.averageRating.toFixed(1)}
                    </span>
                    <span className="text-gray-500">
                      ({resource.totalRatings})
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between p-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`/dashboard/resources/${resource.id}`)
                }
              >
                Ver Detalhes
              </Button>
              {isAdmin && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(resource.id)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setDeleteResourceId(resource.id)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Remover
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog
        open={!!deleteResourceId}
        onOpenChange={(open) => !open && setDeleteResourceId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este recurso? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteResourceId && handleDelete(deleteResourceId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

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
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <Card key={resource.id} className="flex flex-col">
            <CardHeader className="p-3 sm:p-4">
              <div className="flex justify-between items-start gap-2">
                <CardTitle
                  className="text-base sm:text-lg cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
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
                  className="text-xs flex-shrink-0"
                >
                  {resource.status === "available"
                    ? "Disponível"
                    : resource.status === "maintenance"
                    ? "Manutenção"
                    : "Bloqueado"}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {resource.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0 flex-1">
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
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  {resource.description}
                </p>
              )}
              <div className="mt-2 space-y-1 text-xs sm:text-sm">
                {resource.quantity && (
                  <p>
                    <span className="font-medium">Qtd:</span>{" "}
                    {resource.quantity}
                  </p>
                )}
                {resource.capacity && (
                  <p>
                    <span className="font-medium">Cap:</span>{" "}
                    {resource.capacity}
                  </p>
                )}
              </div>
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
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 p-3 sm:p-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() =>
                  router.push(`/dashboard/resources/${resource.id}`)
                }
              >
                Ver Detalhes
              </Button>
              {isAdmin && (
                <div className="flex space-x-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={() => handleEdit(resource.id)}
                  >
                    <Edit className="mr-1 sm:mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Editar</span>
                    <span className="sm:hidden">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive flex-1 sm:flex-none"
                    onClick={() => setDeleteResourceId(resource.id)}
                  >
                    <Trash className="mr-1 sm:mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Remover</span>
                    <span className="sm:hidden">Del</span>
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

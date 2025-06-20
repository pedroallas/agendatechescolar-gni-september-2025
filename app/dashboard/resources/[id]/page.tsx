"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ResourceGallery } from "@/components/resource-gallery";
import { ResourceRatings } from "@/components/resource-ratings";
import { ResourceMaintenance } from "@/components/resource-maintenance";
import { QRCodeManager } from "@/components/qr-code-manager";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit,
  MapPin,
  Package,
  Users,
  Calendar,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface Resource {
  id: string;
  name: string;
  type: string;
  category: string;
  location: string;
  quantity?: number;
  capacity?: number;
  assetId?: string;
  description?: string;
  imageUrl?: string;
  status: string;
  requiresApproval: boolean;
  averageRating?: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
  images: Array<{
    id: string;
    imageUrl: string;
    caption?: string;
    isPrimary: boolean;
    order: number;
  }>;
  _count: {
    bookings: number;
    ratings: number;
  };
}

export default function ResourceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

  const user = session?.user;
  const isAdmin = user?.role === "diretor" || user?.role === "coordenador";

  useEffect(() => {
    const loadResource = async () => {
      try {
        const response = await fetch(`/api/resources/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setResource(data);
        } else if (response.status === 404) {
          toast.error("Recurso não encontrado");
          router.push("/dashboard/resources");
        } else {
          toast.error("Erro ao carregar recurso");
        }
      } catch (error) {
        console.error("Erro ao carregar recurso:", error);
        toast.error("Erro ao carregar recurso");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadResource();
    }
  }, [params.id, router]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "maintenance":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "unavailable":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Disponível";
      case "maintenance":
        return "Em Manutenção";
      case "unavailable":
        return "Indisponível";
      default:
        return "Status Desconhecido";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "unavailable":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryText = (category: string) => {
    const categories: Record<string, string> = {
      datashow: "Data Show",
      tv: "Televisão",
      chromebook: "Chromebook",
      lab: "Laboratório",
      library: "Biblioteca",
      classroom: "Sala de Aula",
    };
    return categories[category] || category;
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded" />
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded" />
              <div className="h-48 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Recurso não encontrado</h2>
          <p className="text-gray-600 mb-4">
            O recurso que você está procurando não existe ou foi removido.
          </p>
          <Link href="/dashboard/resources">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Recursos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/resources">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {resource.name}
            </h1>
            <p className="text-gray-600">
              {getCategoryText(resource.category)} • {resource.location}
            </p>
          </div>
        </div>
        {isAdmin && (
          <Link href={`/dashboard/resources/edit/${resource.id}`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Galeria de Imagens */}
        <ResourceGallery
          resourceId={resource.id}
          resourceName={resource.name}
          isAdmin={isAdmin}
          className="lg:col-span-2"
        />

        {/* Informações do Recurso */}
        <div className="space-y-6">
          {/* Status e Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                📋 Informações Gerais
                <div className="flex items-center space-x-2">
                  {getStatusIcon(resource.status)}
                  <Badge className={getStatusColor(resource.status)}>
                    {getStatusText(resource.status)}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Tipo:</strong>{" "}
                    {resource.type === "equipment" ? "Equipamento" : "Espaço"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Local:</strong> {resource.location}
                  </span>
                </div>
                {resource.quantity && (
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Quantidade:</strong> {resource.quantity}
                    </span>
                  </div>
                )}
                {resource.capacity && (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Capacidade:</strong> {resource.capacity} pessoas
                    </span>
                  </div>
                )}
                {resource.assetId && (
                  <div className="col-span-2 flex items-center space-x-2">
                    <span className="text-sm">
                      <strong>ID do Patrimônio:</strong> {resource.assetId}
                    </span>
                  </div>
                )}
              </div>

              {resource.description && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Descrição</h4>
                    <p className="text-sm text-gray-600">
                      {resource.description}
                    </p>
                  </div>
                </>
              )}

              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span>
                  <strong>Requer Aprovação:</strong>{" "}
                  {resource.requiresApproval ? "Sim" : "Não"}
                </span>
                {resource.averageRating && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>
                      {resource.averageRating.toFixed(1)} (
                      {resource.totalRatings} avaliações)
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas de Uso */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Estatísticas de Uso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {resource._count.bookings}
                  </div>
                  <div className="text-sm text-blue-600">Agendamentos</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600">
                    {resource._count.ratings}
                  </div>
                  <div className="text-sm text-yellow-600">Avaliações</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>⚡ Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href={`/dashboard/schedule?resource=${resource.id}`}>
                  <Button className="w-full" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar Recurso
                  </Button>
                </Link>
                <Link href={`/dashboard/my-bookings?resource=${resource.id}`}>
                  <Button className="w-full" variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    Ver Agendamentos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* QR Code */}
          <QRCodeManager
            resourceId={resource.id}
            resourceName={resource.name}
            isAdmin={isAdmin}
          />
        </div>

        {/* Sistema de Avaliações */}
        <ResourceRatings
          resourceId={resource.id}
          resourceName={resource.name}
          className="lg:col-span-3"
        />

        {/* Sistema de Manutenção */}
        <ResourceMaintenance
          resourceId={resource.id}
          resourceName={resource.name}
          isAdmin={isAdmin}
          className="lg:col-span-3"
        />
      </div>
    </div>
  );
}

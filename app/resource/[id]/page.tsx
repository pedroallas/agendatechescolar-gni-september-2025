"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ResourceGallery } from "@/components/resource-gallery";
import { ResourceRatings } from "@/components/resource-ratings";
import {
  MapPin,
  Package,
  Users,
  Calendar,
  Star,
  QrCode,
  ExternalLink,
  Smartphone,
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
  status: string;
  averageRating?: number;
  totalRatings: number;
  images: Array<{
    id: string;
    imageUrl: string;
    caption?: string;
    isPrimary: boolean;
  }>;
}

export default function PublicResourcePage() {
  const params = useParams();
  const id = params.id as string;
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await fetch(`/api/resources/${id}`);
        if (response.ok) {
          const data = await response.json();
          setResource(data);
        } else {
          setError("Recurso não encontrado");
        }
      } catch (error) {
        setError("Erro ao carregar recurso");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResource();
    }
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "unavailable":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
        return status;
    }
  };

  const getCategoryText = (category: string) => {
    const categories: { [key: string]: string } = {
      datashow: "Data Show",
      tv: "TV",
      chromebook: "Chromebook",
      sound: "Caixa de Som",
      lab: "Laboratório",
      library: "Biblioteca",
      other: "Outro",
    };
    return categories[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando recurso...</p>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <QrCode className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">
              Recurso não encontrado
            </h2>
            <p className="text-gray-600 mb-4">
              O recurso que você está procurando não existe ou foi removido.
            </p>
            <Button asChild>
              <Link href="/">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ir para o site
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <QrCode className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AgendaTech</h1>
                <p className="text-sm text-gray-600">
                  Sistema de Recursos Escolares
                </p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href="/login">
                <ExternalLink className="h-4 w-4 mr-2" />
                Acessar Sistema
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {resource.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant="outline">
                        {getCategoryText(resource.category)}
                      </Badge>
                      <Badge className={getStatusColor(resource.status)}>
                        {getStatusText(resource.status)}
                      </Badge>
                    </div>
                  </div>
                  {resource.averageRating && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">
                        {resource.averageRating.toFixed(1)}
                      </span>
                      <span className="text-gray-500">
                        ({resource.totalRatings})
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {resource.description && (
                  <p className="text-gray-700">{resource.description}</p>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{resource.location}</span>
                  </div>

                  {resource.quantity && (
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {resource.quantity} unidades
                      </span>
                    </div>
                  )}

                  {resource.capacity && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        Capacidade: {resource.capacity}
                      </span>
                    </div>
                  )}

                  {resource.assetId && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        Patrimônio: {resource.assetId}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Gallery */}
            {resource.images && resource.images.length > 0 && (
              <ResourceGallery
                resourceId={resource.id}
                resourceName={resource.name}
                isAdmin={false}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* QR Code Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5" />
                  <span>Acesso Rápido</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Você acessou este recurso através de um QR Code! Para fazer
                  agendamentos, acesse o sistema completo.
                </p>
                <Button asChild className="w-full">
                  <Link href="/login">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Fazer Agendamento
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Ratings */}
            <ResourceRatings
              resourceId={resource.id}
              resourceName={resource.name}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-600">
            © 2024 AgendaTech - Sistema de Gestão de Recursos Escolares
          </p>
        </div>
      </div>
    </div>
  );
}

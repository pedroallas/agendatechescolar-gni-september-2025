"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageUpload } from "@/components/ui/image-upload";

export default function EditResourcePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar dados do recurso
  useEffect(() => {
    async function fetchResource() {
      try {
        setLoading(true);
        const res = await fetch(`/api/resources/${id}`);
        if (!res.ok) {
          throw new Error("Falha ao carregar recurso");
        }
        const data = await res.json();
        setResource(data);
      } catch (error) {
        console.error("Erro ao carregar recurso:", error);
        setError("Não foi possível carregar os dados do recurso");
      } finally {
        setLoading(false);
      }
    }

    fetchResource();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/resources/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resource),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Falha ao atualizar recurso");
      }

      router.push("/dashboard/resources");
    } catch (error: any) {
      console.error("Erro ao atualizar recurso:", error);
      setSubmitError(error.message || "Ocorreu um erro ao atualizar o recurso");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setResource((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setResource((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    if (name === "status") {
      setResource((prev: any) => ({
        ...prev,
        status: checked ? "available" : "maintenance",
      }));
    } else {
      setResource((prev: any) => ({
        ...prev,
        [name]: checked,
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/15 text-destructive p-4 rounded-md">
        <p>{error}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/dashboard/resources">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para recursos
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center">
        <Button variant="outline" size="sm" className="mr-4" asChild>
          <Link href="/dashboard/resources">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Editar Recurso</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Informações do Recurso</CardTitle>
          <CardDescription>
            Atualize as informações do recurso abaixo.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Recurso</Label>
                <Input
                  id="name"
                  name="name"
                  value={resource?.name || ""}
                  onChange={handleChange}
                  required
                  placeholder="Nome do recurso"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={resource?.type || ""}
                  onValueChange={(value) => handleSelectChange("type", value)}
                  required
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equipment">Equipamento</SelectItem>
                    <SelectItem value="spaces">Espaço</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={resource?.category || ""}
                  onValueChange={(value) =>
                    handleSelectChange("category", value)
                  }
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="datashow">Data Show</SelectItem>
                    <SelectItem value="tv">TV</SelectItem>
                    <SelectItem value="chromebook">Chromebook</SelectItem>
                    <SelectItem value="sound">Caixa de Som</SelectItem>
                    <SelectItem value="lab">Laboratório</SelectItem>
                    <SelectItem value="library">Biblioteca</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  name="location"
                  value={resource?.location || ""}
                  onChange={handleChange}
                  required
                  placeholder="Onde o recurso está localizado"
                />
              </div>

              {resource?.type === "equipment" && (
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={resource?.quantity || ""}
                    onChange={handleChange}
                    placeholder="Quantidade disponível"
                  />
                </div>
              )}

              {resource?.type === "spaces" && (
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidade</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    value={resource?.capacity || ""}
                    onChange={handleChange}
                    placeholder="Capacidade do espaço"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="assetId">ID do Patrimônio</Label>
                <Input
                  id="assetId"
                  name="assetId"
                  value={resource?.assetId || ""}
                  onChange={handleChange}
                  placeholder="Número de patrimônio (opcional)"
                />
              </div>

              <div className="col-span-2">
                <ImageUpload
                  value={resource?.imageUrl || ""}
                  onChange={(url) =>
                    setResource((prev: any) => ({ ...prev, imageUrl: url }))
                  }
                  onRemove={() =>
                    setResource((prev: any) => ({ ...prev, imageUrl: "" }))
                  }
                  disabled={isSubmitting}
                  label="Imagem do Recurso"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL da Imagem (alternativo)</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={resource?.imageUrl || ""}
                  onChange={handleChange}
                  placeholder="Cole uma URL de imagem aqui (opcional)"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={resource?.description || ""}
                  onChange={handleChange}
                  placeholder="Descrição detalhada do recurso"
                  rows={3}
                />
              </div>

              <div className="col-span-2 space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <Label
                      htmlFor="requiresApproval"
                      className="text-base font-medium"
                    >
                      Requer Aprovação do Administrador
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {resource?.requiresApproval
                        ? "Agendamentos deste recurso ficarão pendentes até aprovação do administrador"
                        : "Agendamentos deste recurso serão aprovados automaticamente"}
                    </p>
                  </div>
                  <Switch
                    id="requiresApproval"
                    checked={resource?.requiresApproval || false}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("requiresApproval", checked)
                    }
                  />
                </div>
              </div>

              <div className="col-span-2 flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={resource?.status === "available"}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("status", checked)
                  }
                />
                <Label htmlFor="status" className="cursor-pointer">
                  Disponível para agendamento
                </Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/dashboard/resources">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

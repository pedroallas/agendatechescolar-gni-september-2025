"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Star,
  Upload,
  X,
  Maximize2,
} from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

interface ResourceImage {
  id: string;
  imageUrl: string;
  caption?: string;
  isPrimary: boolean;
  order: number;
  createdAt: string;
}

interface ResourceGalleryProps {
  resourceId: string;
  resourceName: string;
  isAdmin?: boolean;
  className?: string;
}

export function ResourceGallery({
  resourceId,
  resourceName,
  isAdmin = false,
  className = "",
}: ResourceGalleryProps) {
  const [images, setImages] = useState<ResourceImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [addImageOpen, setAddImageOpen] = useState(false);
  const [editImageOpen, setEditImageOpen] = useState(false);
  const [deleteImageOpen, setDeleteImageOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ResourceImage | null>(
    null
  );
  const [imageToDelete, setImageToDelete] = useState<ResourceImage | null>(
    null
  );

  // Form states
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [uploadMode, setUploadMode] = useState<"url" | "upload">("upload");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  // Carregar imagens
  const loadImages = async () => {
    try {
      const response = await fetch(`/api/resources/${resourceId}/images`);
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      }
    } catch (error) {
      console.error("Erro ao carregar imagens:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [resourceId]);

  // Adicionar nova imagem
  const handleAddImage = async () => {
    const finalImageUrl = uploadMode === "upload" ? uploadedImageUrl : imageUrl;

    if (!finalImageUrl.trim()) {
      toast.error("Imagem é obrigatória");
      return;
    }

    try {
      const response = await fetch(`/api/resources/${resourceId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: finalImageUrl.trim(),
          caption: caption.trim() || undefined,
          isPrimary,
        }),
      });

      if (response.ok) {
        toast.success("Imagem adicionada com sucesso!");
        setAddImageOpen(false);
        setImageUrl("");
        setCaption("");
        setIsPrimary(false);
        setUploadedImageUrl("");
        loadImages();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao adicionar imagem");
      }
    } catch (error) {
      toast.error("Erro ao adicionar imagem");
    }
  };

  // Editar imagem
  const handleEditImage = async () => {
    if (!selectedImage) return;

    try {
      const response = await fetch(
        `/api/resources/${resourceId}/images/${selectedImage.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caption: caption.trim() || undefined,
            isPrimary,
          }),
        }
      );

      if (response.ok) {
        toast.success("Imagem atualizada com sucesso!");
        setEditImageOpen(false);
        setSelectedImage(null);
        loadImages();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao atualizar imagem");
      }
    } catch (error) {
      toast.error("Erro ao atualizar imagem");
    }
  };

  // Abrir confirmação de deleção
  const openDeleteConfirmation = (image: ResourceImage) => {
    setImageToDelete(image);
    setDeleteImageOpen(true);
  };

  // Deletar imagem
  const handleDeleteImage = async () => {
    if (!imageToDelete) return;

    try {
      const response = await fetch(
        `/api/resources/${resourceId}/images/${imageToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Imagem removida com sucesso!");
        setDeleteImageOpen(false);
        setImageToDelete(null);
        loadImages();
        if (currentIndex >= images.length - 1) {
          setCurrentIndex(Math.max(0, images.length - 2));
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao remover imagem");
      }
    } catch (error) {
      toast.error("Erro ao remover imagem");
    }
  };

  // Navegação do carousel
  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Abrir edição
  const openEditImage = (image: ResourceImage) => {
    setSelectedImage(image);
    setCaption(image.caption || "");
    setIsPrimary(image.isPrimary);
    setEditImageOpen(true);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg mb-4" />
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 w-16 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (images.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            📸 Galeria de Imagens
            {isAdmin && (
              <Dialog open={addImageOpen} onOpenChange={setAddImageOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Imagem
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Adicionar Nova Imagem</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Seletor de modo */}
                    <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
                      <Button
                        type="button"
                        variant={uploadMode === "upload" ? "default" : "ghost"}
                        size="sm"
                        className="flex-1"
                        onClick={() => setUploadMode("upload")}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                      <Button
                        type="button"
                        variant={uploadMode === "url" ? "default" : "ghost"}
                        size="sm"
                        className="flex-1"
                        onClick={() => setUploadMode("url")}
                      >
                        🔗 URL
                      </Button>
                    </div>

                    {/* Campo de imagem */}
                    {uploadMode === "upload" ? (
                      <div>
                        <Label>Fazer Upload da Imagem</Label>
                        <ImageUpload
                          value={uploadedImageUrl}
                          onChange={setUploadedImageUrl}
                          onRemove={() => setUploadedImageUrl("")}
                        />
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="imageUrl">URL da Imagem</Label>
                        <Input
                          id="imageUrl"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://exemplo.com/imagem.jpg"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="caption">Legenda (opcional)</Label>
                      <Textarea
                        id="caption"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Descrição da imagem..."
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isPrimary"
                        checked={isPrimary}
                        onCheckedChange={setIsPrimary}
                      />
                      <Label htmlFor="isPrimary">Imagem principal</Label>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAddImageOpen(false);
                          setImageUrl("");
                          setCaption("");
                          setIsPrimary(false);
                          setUploadedImageUrl("");
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleAddImage}>Adicionar</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma imagem disponível</p>
            {isAdmin && (
              <p className="text-sm mt-2">
                Clique em "Adicionar Imagem" para começar a galeria
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            📸 Galeria de Imagens ({images.length})
            {isAdmin && (
              <Dialog open={addImageOpen} onOpenChange={setAddImageOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Adicionar Nova Imagem</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Seletor de modo */}
                    <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
                      <Button
                        type="button"
                        variant={uploadMode === "upload" ? "default" : "ghost"}
                        size="sm"
                        className="flex-1"
                        onClick={() => setUploadMode("upload")}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                      <Button
                        type="button"
                        variant={uploadMode === "url" ? "default" : "ghost"}
                        size="sm"
                        className="flex-1"
                        onClick={() => setUploadMode("url")}
                      >
                        🔗 URL
                      </Button>
                    </div>

                    {/* Campo de imagem */}
                    {uploadMode === "upload" ? (
                      <div>
                        <Label>Fazer Upload da Imagem</Label>
                        <ImageUpload
                          value={uploadedImageUrl}
                          onChange={setUploadedImageUrl}
                          onRemove={() => setUploadedImageUrl("")}
                        />
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="imageUrl">URL da Imagem</Label>
                        <Input
                          id="imageUrl"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://exemplo.com/imagem.jpg"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="caption">Legenda (opcional)</Label>
                      <Textarea
                        id="caption"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Descrição da imagem..."
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isPrimary"
                        checked={isPrimary}
                        onCheckedChange={setIsPrimary}
                      />
                      <Label htmlFor="isPrimary">Imagem principal</Label>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAddImageOpen(false);
                          setImageUrl("");
                          setCaption("");
                          setIsPrimary(false);
                          setUploadedImageUrl("");
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleAddImage}>Adicionar</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Imagem Principal */}
          <div className="relative mb-4">
            <div className="relative h-64 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={currentImage.imageUrl}
                alt={currentImage.caption || resourceName}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />

              {/* Badges */}
              <div className="absolute top-2 left-2 flex space-x-2">
                {currentImage.isPrimary && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Principal
                  </Badge>
                )}
              </div>

              {/* Controles de navegação */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Botão para lightbox */}
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-2 right-2"
                onClick={() => setLightboxOpen(true)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>

              {/* Controles de admin */}
              {isAdmin && (
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEditImage(currentImage)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteConfirmation(currentImage)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Legenda */}
            {currentImage.caption && (
              <p className="text-sm text-gray-600 mt-2 text-center">
                {currentImage.caption}
              </p>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  className={`relative flex-shrink-0 h-16 w-16 rounded overflow-hidden border-2 transition-colors ${
                    index === currentIndex
                      ? "border-blue-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <Image
                    src={image.imageUrl}
                    alt={image.caption || `Imagem ${index + 1}`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                  {image.isPrimary && (
                    <div className="absolute top-0 right-0 bg-yellow-400 rounded-bl-md p-0.5">
                      <Star className="h-2 w-2 text-yellow-800" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <div className="relative">
            <Image
              src={currentImage.imageUrl}
              alt={currentImage.caption || resourceName}
              width={800}
              height={600}
              className="w-full h-auto max-h-[80vh] object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            {currentImage.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4">
                <p className="text-center">{currentImage.caption}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={editImageOpen} onOpenChange={setEditImageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Imagem</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editCaption">Legenda</Label>
              <Textarea
                id="editCaption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Descrição da imagem..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="editIsPrimary"
                checked={isPrimary}
                onCheckedChange={setIsPrimary}
              />
              <Label htmlFor="editIsPrimary">Imagem principal</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditImageOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditImage}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteImageOpen} onOpenChange={setDeleteImageOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Confirmar Exclusão
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {imageToDelete && (
              <>
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden border">
                    <Image
                      src={imageToDelete.imageUrl}
                      alt={imageToDelete.caption || "Imagem"}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {imageToDelete.caption || "Sem legenda"}
                  </p>
                  {imageToDelete.isPrimary && (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800 mb-2"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Imagem Principal
                    </Badge>
                  )}
                </div>
                <p className="text-center text-gray-700">
                  Tem certeza que deseja remover esta imagem?
                </p>
                <p className="text-center text-sm text-red-600">
                  Esta ação não pode ser desfeita.
                </p>
              </>
            )}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteImageOpen(false);
                  setImageToDelete(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteImage}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

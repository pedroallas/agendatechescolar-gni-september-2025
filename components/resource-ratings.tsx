"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Star,
  MessageCircle,
  Edit,
  Trash2,
  Plus,
  User,
  BarChart3,
} from "lucide-react";

interface Rating {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

interface RatingStats {
  totalRatings: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ResourceRatingsProps {
  resourceId: string;
  resourceName: string;
  className?: string;
}

export function ResourceRatings({
  resourceId,
  resourceName,
  className = "",
}: ResourceRatingsProps) {
  const { data: session } = useSession();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [addRatingOpen, setAddRatingOpen] = useState(false);
  const [editRatingOpen, setEditRatingOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);

  // Form states
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [editRatingValue, setEditRatingValue] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Carregar avaliações
  const loadRatings = async () => {
    try {
      const response = await fetch(`/api/resources/${resourceId}/ratings`);
      if (response.ok) {
        const data = await response.json();
        setRatings(data.ratings);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRatings();
  }, [resourceId]);

  // Adicionar nova avaliação
  const handleAddRating = async () => {
    if (!newRating || newRating < 1 || newRating > 5) {
      toast.error("Selecione uma avaliação de 1 a 5 estrelas");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/resources/${resourceId}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: newRating,
          comment: newComment.trim() || undefined,
        }),
      });

      if (response.ok) {
        toast.success("Avaliação adicionada com sucesso!");
        setAddRatingOpen(false);
        setNewRating(0);
        setNewComment("");
        await loadRatings();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao adicionar avaliação");
      }
    } catch (error) {
      toast.error("Erro ao adicionar avaliação");
    } finally {
      setSubmitting(false);
    }
  };

  // Editar avaliação
  const handleEditRating = async () => {
    if (
      !selectedRating ||
      !editRatingValue ||
      editRatingValue < 1 ||
      editRatingValue > 5
    ) {
      toast.error("Selecione uma avaliação de 1 a 5 estrelas");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `/api/resources/${resourceId}/ratings/${selectedRating.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating: editRatingValue,
            comment: editComment.trim() || undefined,
          }),
        }
      );

      if (response.ok) {
        toast.success("Avaliação atualizada com sucesso!");
        setEditRatingOpen(false);
        setSelectedRating(null);
        await loadRatings();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao atualizar avaliação");
      }
    } catch (error) {
      toast.error("Erro ao atualizar avaliação");
    } finally {
      setSubmitting(false);
    }
  };

  // Deletar avaliação
  const handleDeleteRating = async (ratingId: string) => {
    if (!confirm("Tem certeza que deseja remover esta avaliação?")) return;

    try {
      const response = await fetch(
        `/api/resources/${resourceId}/ratings/${ratingId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Avaliação removida com sucesso!");
        await loadRatings();
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao remover avaliação");
      }
    } catch (error) {
      toast.error("Erro ao remover avaliação");
    }
  };

  // Abrir edição
  const openEditRating = (rating: Rating) => {
    setSelectedRating(rating);
    setEditRatingValue(rating.rating);
    setEditComment(rating.comment || "");
    setEditRatingOpen(true);
  };

  // Renderizar estrelas
  const renderStars = (
    rating: number,
    interactive = false,
    onStarClick?: (star: number) => void
  ) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${
              interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
            } transition-transform`}
            onClick={() => interactive && onStarClick?.(star)}
            disabled={!interactive}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  // Verificar se o usuário já avaliou
  const userRating = ratings.find((r) => r.user.id === session?.user?.id);
  const canAddRating = session?.user && !userRating;

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <span>Avaliações ({stats?.totalRatings || 0})</span>
            </div>
            {canAddRating && (
              <Dialog open={addRatingOpen} onOpenChange={setAddRatingOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Avaliar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Avaliar {resourceName}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Sua Avaliação</Label>
                      <div className="mt-2">
                        {renderStars(newRating, true, setNewRating)}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="comment">Comentário (opcional)</Label>
                      <Textarea
                        id="comment"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Compartilhe sua experiência com este recurso..."
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setAddRatingOpen(false)}
                        disabled={submitting}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAddRating}
                        disabled={submitting || !newRating}
                      >
                        Enviar Avaliação
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats && stats.totalRatings > 0 ? (
            <>
              {/* Estatísticas */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">
                      {stats.averageRating}
                    </div>
                    <div className="flex justify-center mb-1">
                      {renderStars(Math.round(stats.averageRating))}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stats.totalRatings} avaliação
                      {stats.totalRatings !== 1 ? "ões" : ""}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div
                        key={star}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <span className="w-8">{star}★</span>
                        <Progress
                          value={
                            (stats.ratingDistribution[
                              star as keyof typeof stats.ratingDistribution
                            ] /
                              stats.totalRatings) *
                            100
                          }
                          className="flex-1 h-2"
                        />
                        <span className="w-8 text-gray-600">
                          {
                            stats.ratingDistribution[
                              star as keyof typeof stats.ratingDistribution
                            ]
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lista de avaliações */}
              <div className="space-y-4">
                {ratings.map((rating) => (
                  <div
                    key={rating.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <div className="bg-blue-500 text-white w-full h-full flex items-center justify-center text-sm font-medium">
                            {rating.user.name.charAt(0).toUpperCase()}
                          </div>
                        </Avatar>
                        <div>
                          <div className="font-medium">{rating.user.name}</div>
                          <div className="flex items-center space-x-2">
                            {renderStars(rating.rating)}
                            <Badge variant="outline" className="text-xs">
                              {rating.user.role === "professor"
                                ? "Professor"
                                : rating.user.role === "diretor"
                                ? "Diretor"
                                : "Coordenador"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {(session?.user?.id === rating.user.id ||
                        session?.user?.role === "diretor" ||
                        session?.user?.role === "coordenador") && (
                        <div className="flex space-x-1">
                          {session?.user?.id === rating.user.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditRating(rating)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRating(rating.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {rating.comment && (
                      <p className="text-gray-700 pl-11">{rating.comment}</p>
                    )}
                    <div className="text-xs text-gray-500 pl-11">
                      {new Date(rating.createdAt).toLocaleDateString("pt-BR")}
                      {rating.updatedAt !== rating.createdAt && " (editado)"}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma avaliação ainda</p>
              {canAddRating && (
                <p className="text-sm mt-2">
                  Seja o primeiro a avaliar este recurso!
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={editRatingOpen} onOpenChange={setEditRatingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Avaliação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Sua Avaliação</Label>
              <div className="mt-2">
                {renderStars(editRatingValue, true, setEditRatingValue)}
              </div>
            </div>
            <div>
              <Label htmlFor="editComment">Comentário (opcional)</Label>
              <Textarea
                id="editComment"
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                placeholder="Compartilhe sua experiência com este recurso..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setEditRatingOpen(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEditRating}
                disabled={submitting || !editRatingValue}
              >
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

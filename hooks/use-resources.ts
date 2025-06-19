"use client";

import { useState, useEffect } from "react";

export type Resource = {
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
};

export function useResources(type?: string) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const url = type ? `/api/resources?type=${type}` : "/api/resources";
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error("Falha ao carregar recursos");
        }

        const data = await res.json();
        setResources(data);
      } catch (error) {
        console.error("Erro ao carregar recursos:", error);
        setError(
          "Não foi possível carregar os recursos. Tente novamente mais tarde."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [type]);

  return { resources, isLoading, error };
}

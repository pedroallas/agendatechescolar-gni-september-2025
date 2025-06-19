"use client"

import { useState, useEffect } from "react"

export type TimeBlock = {
  id: string
  startTime: string
  endTime: string
  label: string
  shift: string
}

export function useTimeBlocks(shift?: string) {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTimeBlocks = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const url = shift ? `/api/time-blocks?shift=${shift}` : "/api/time-blocks"
        const res = await fetch(url)

        if (!res.ok) {
          throw new Error("Falha ao carregar blocos de horário")
        }

        const data = await res.json()
        setTimeBlocks(data)
      } catch (error) {
        console.error("Erro ao carregar blocos de horário:", error)
        setError("Não foi possível carregar os blocos de horário. Tente novamente mais tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTimeBlocks()
  }, [shift])

  return { timeBlocks, isLoading, error }
}

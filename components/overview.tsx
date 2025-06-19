"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

// Dados de exemplo
const data = [
  {
    name: "Seg",
    total: 12,
  },
  {
    name: "Ter",
    total: 18,
  },
  {
    name: "Qua",
    total: 15,
  },
  {
    name: "Qui",
    total: 22,
  },
  {
    name: "Sex",
    total: 20,
  },
  {
    name: "Sáb",
    total: 8,
  },
  {
    name: "Dom",
    total: 2,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}

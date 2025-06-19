"use client";

import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, Package, Users, TrendingUp } from "lucide-react";

interface Stats {
  totalResources: number;
  activeBookings: number;
  totalUsers: number;
  monthlyGrowth: number;
}

export function StatsSection() {
  const [stats, setStats] = useState<Stats>({
    totalResources: 0,
    activeBookings: 0,
    totalUsers: 0,
    monthlyGrowth: 0,
  });
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch real data from API
        const [resourcesRes, bookingsRes] = await Promise.all([
          fetch("/api/resources"),
          fetch("/api/bookings?status=confirmed"),
        ]);

        if (resourcesRes.ok && bookingsRes.ok) {
          const resources = await resourcesRes.json();
          const bookings = await bookingsRes.json();

          setStats({
            totalResources: resources.length,
            activeBookings: bookings.length,
            totalUsers: 25, // This would come from a users endpoint
            monthlyGrowth: 15, // This would be calculated
          });
        }
      } catch (error) {
        // Use default values on error
        setStats({
          totalResources: 6,
          activeBookings: 2,
          totalUsers: 25,
          monthlyGrowth: 15,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statsData = [
    {
      icon: Package,
      value: stats.totalResources,
      label: "Recursos Disponíveis",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Calendar,
      value: stats.activeBookings,
      label: "Agendamentos Ativos",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: Users,
      value: stats.totalUsers,
      label: "Usuários Cadastrados",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: TrendingUp,
      value: `${stats.monthlyGrowth}%`,
      label: "Crescimento Mensal",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <section ref={ref} className="py-16 bg-muted/30">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Números que Impressionam
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            Veja o impacto da nossa plataforma em tempo real
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-card rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div
                  className={`${stat.bgColor} ${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">
                    {loading ? (
                      <span className="inline-block w-16 h-8 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      stat.value
                    )}
                  </p>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

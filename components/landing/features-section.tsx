"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Monitor,
  Smartphone,
  BarChart3,
  Bell,
  Shield,
  Clock,
  Users,
  Zap,
  Globe,
} from "lucide-react";

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const features = [
    {
      icon: Monitor,
      title: "Equipamentos Diversos",
      description:
        "Gerencie data shows, TVs, chromebooks e outros equipamentos escolares",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Globe,
      title: "Espaços Físicos",
      description:
        "Reserve laboratórios, bibliotecas, auditórios e salas especiais",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Clock,
      title: "Horários Flexíveis",
      description:
        "Sistema de blocos de horário adaptado ao cronograma escolar",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: BarChart3,
      title: "Relatórios Detalhados",
      description:
        "Visualize estatísticas de uso e otimize a gestão de recursos",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: Bell,
      title: "Notificações Inteligentes",
      description: "Receba lembretes e atualizações sobre seus agendamentos",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      icon: Shield,
      title: "Segurança Garantida",
      description: "Dados protegidos e acesso controlado por perfis de usuário",
      gradient: "from-gray-600 to-gray-800",
    },
    {
      icon: Users,
      title: "Multi-perfil",
      description:
        "Diferentes níveis de acesso para professores, coordenadores e diretores",
      gradient: "from-teal-500 to-blue-500",
    },
    {
      icon: Smartphone,
      title: "100% Responsivo",
      description: "Acesse de qualquer dispositivo, em qualquer lugar",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: Zap,
      title: "Ultra Rápido",
      description: "Interface otimizada para agendamentos em segundos",
      gradient: "from-yellow-500 to-orange-500",
    },
  ];

  return (
    <section ref={ref} id="features" className="py-16 bg-muted/30">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Recursos Completos
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg max-w-2xl mx-auto">
            Tudo que sua escola precisa para gerenciar recursos de forma
            eficiente
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="bg-card rounded-xl p-6 h-full shadow-sm border hover:shadow-xl transition-all duration-300">
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

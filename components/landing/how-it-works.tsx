"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { UserPlus, Calendar, CheckCircle, Smartphone } from "lucide-react";

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const steps = [
    {
      icon: UserPlus,
      title: "Cadastre-se",
      description:
        "Crie sua conta em menos de 1 minuto com seu email institucional",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Calendar,
      title: "Escolha o Recurso",
      description:
        "Navegue pelos recursos disponíveis e selecione o que precisa",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: CheckCircle,
      title: "Agende",
      description:
        "Selecione data e horário disponível e confirme seu agendamento",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: Smartphone,
      title: "Receba Confirmação",
      description:
        "Receba notificação instantânea e gerencie seus agendamentos",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <section ref={ref} id="how-it-works" className="py-16 bg-background">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Como Funciona?
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg max-w-2xl mx-auto">
            Em apenas 4 passos simples, você pode agendar qualquer recurso da
            escola
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative"
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gray-200">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-300 rounded-full" />
                </div>
              )}

              <div className="text-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`${step.bgColor} ${step.color} w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
                >
                  <step.icon className="h-10 w-10" />
                </motion.div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
                <div className="mt-4 text-3xl font-bold text-gray-200">
                  {String(index + 1).padStart(2, "0")}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

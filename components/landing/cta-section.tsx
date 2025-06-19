"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      className="py-16 bg-gradient-to-r from-primary to-primary/80 dark:from-primary/90 dark:to-primary/70"
    >
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="bg-background/10 dark:bg-background/20 backdrop-blur-sm rounded-3xl p-8 md:p-12 text-center border border-white/20 dark:border-white/10"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 dark:bg-white/30 px-4 py-2 rounded-full text-white dark:text-white text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>Comece hoje mesmo</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white dark:text-white max-w-3xl mx-auto">
              Transforme a gestão de recursos da sua escola
            </h2>

            <p className="text-lg md:text-xl text-white/90 dark:text-white/95 max-w-2xl mx-auto">
              Junte-se a centenas de escolas que já modernizaram seus processos
              de agendamento
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white hover:bg-white/90 text-primary dark:text-black font-semibold text-lg px-8 py-6 group shadow-lg border-0"
                >
                  Criar Conta Gratuita
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary dark:hover:text-black font-semibold text-lg px-8 py-6 transition-colors"
                >
                  Já tenho conta
                </Button>
              </Link>
            </div>

            <div className="mt-8 text-white/80 dark:text-white/90 text-sm">
              <p>✓ Sem cartão de crédito</p>
              <p>✓ Setup em 5 minutos</p>
              <p>✓ Suporte dedicado</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

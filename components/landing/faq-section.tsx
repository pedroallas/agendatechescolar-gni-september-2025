"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const faqs = [
    {
      question: "Como faço para começar a usar o sistema?",
      answer:
        "É muito simples! Basta se cadastrar com seu email institucional, aguardar a aprovação do administrador e você já pode começar a fazer agendamentos.",
    },
    {
      question: "Quais tipos de recursos posso agendar?",
      answer:
        "Você pode agendar equipamentos como data shows, TVs, chromebooks, equipamentos de som, além de espaços físicos como laboratórios, biblioteca, auditório e salas especiais.",
    },
    {
      question: "Posso cancelar um agendamento?",
      answer:
        "Sim! Você pode cancelar seus agendamentos a qualquer momento através do painel 'Meus Agendamentos'. Recomendamos cancelar com antecedência para liberar o recurso para outros usuários.",
    },
    {
      question: "Como funciona o sistema de notificações?",
      answer:
        "Você receberá notificações por email sobre confirmações de agendamento, lembretes próximos ao horário agendado e quaisquer alterações importantes.",
    },
    {
      question: "Há limite de agendamentos por usuário?",
      answer:
        "Não há limite fixo, mas o sistema permite que administradores estabeleçam políticas de uso justo para garantir que todos tenham acesso aos recursos.",
    },
    {
      question: "O sistema funciona em dispositivos móveis?",
      answer:
        "Sim! Nossa plataforma é 100% responsiva e funciona perfeitamente em smartphones, tablets e computadores.",
    },
    {
      question: "Como são definidos os horários disponíveis?",
      answer:
        "Os horários são organizados em blocos que correspondem aos períodos de aula da escola. Os administradores podem personalizar esses blocos conforme necessário.",
    },
    {
      question: "É possível fazer agendamentos recorrentes?",
      answer:
        "Atualmente o sistema permite agendamentos únicos, mas a funcionalidade de agendamentos recorrentes está em desenvolvimento.",
    },
  ];

  return (
    <section ref={ref} id="faq" className="py-16 bg-background">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Perguntas Frequentes
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg max-w-2xl mx-auto">
            Tire suas dúvidas sobre o AgendaTech Escolar
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-base font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

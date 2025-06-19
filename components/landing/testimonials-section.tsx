"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  school: string;
  avatar: string;
  rating: number;
  testimonial: string;
  highlight: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Maria Silva",
    role: "Diretora",
    school: "Escola Municipal Dom Pedro II",
    avatar: "/api/placeholder/150/150",
    rating: 5,
    testimonial:
      "O AgendaTech revolucionou nossa gestão de recursos. Antes levávamos 15 minutos para agendar um data show, hoje são apenas 30 segundos. A economia de tempo é impressionante!",
    highlight: "Economia de tempo impressionante",
  },
  {
    id: 2,
    name: "João Santos",
    role: "Coordenador Pedagógico",
    school: "Colégio Estadual São José",
    avatar: "/api/placeholder/150/150",
    rating: 5,
    testimonial:
      "Acabaram os conflitos de agendamento! O sistema mostra em tempo real o que está disponível. Nossos professores adoraram a praticidade e a interface moderna.",
    highlight: "Zero conflitos de agendamento",
  },
  {
    id: 3,
    name: "Ana Costa",
    role: "Professora de Ciências",
    school: "Instituto Educacional Futuro",
    avatar: "/api/placeholder/150/150",
    rating: 5,
    testimonial:
      "Como professora, posso agendar o laboratório de ciências direto do meu celular. O sistema é intuitivo e me avisa quando meus recursos estão confirmados. Perfeito!",
    highlight: "Agendamento pelo celular",
  },
  {
    id: 4,
    name: "Carlos Rodrigues",
    role: "Diretor de TI",
    school: "Escola Técnica inovaTech",
    avatar: "/api/placeholder/150/150",
    rating: 5,
    testimonial:
      "A implementação foi super rápida e o suporte é excelente. Conseguimos digitalizar toda nossa gestão de recursos em menos de uma semana. Recomendo!",
    highlight: "Implementação em uma semana",
  },
  {
    id: 5,
    name: "Fernanda Lima",
    role: "Vice-Diretora",
    school: "Colégio Particular Excellence",
    avatar: "/api/placeholder/150/150",
    rating: 5,
    testimonial:
      "Os relatórios são fantásticos! Agora sabemos exatamente como nossos recursos são utilizados e podemos planejar melhor as aquisições futuras.",
    highlight: "Relatórios detalhados",
  },
  {
    id: 6,
    name: "Roberto Oliveira",
    role: "Professor de História",
    school: "Escola Estadual Tiradentes",
    avatar: "/api/placeholder/150/150",
    rating: 5,
    testimonial:
      "O que mais me impressiona é a facilidade de uso. Mesmo sendo menos experiente com tecnologia, consegui aprender a usar o sistema em poucos minutos.",
    highlight: "Extremamente fácil de usar",
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play do carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-16 bg-gradient-to-br from-muted/30 to-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-4 dark:bg-orange-900 dark:text-orange-300">
            <Star className="h-4 w-4 fill-current" />
            Depoimentos
          </div>
          <h2 className="text-3xl font-bold mb-4">
            O que nossos <span className="text-primary">usuários dizem</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Mais de 150 escolas já transformaram sua gestão de recursos com o
            AgendaTech. Veja os resultados!
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Testimonial Principal */}
          <div
            className="relative"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="relative overflow-hidden">
                  <div className="absolute top-4 left-4 text-primary/20">
                    <Quote className="h-16 w-16" />
                  </div>

                  <CardContent className="p-8 md:p-12">
                    <div className="grid md:grid-cols-3 gap-8 items-center">
                      {/* Avatar e Info */}
                      <div className="text-center">
                        <Avatar className="h-24 w-24 mx-auto mb-4 ring-4 ring-primary/10">
                          <AvatarImage
                            src={currentTestimonial.avatar}
                            alt={currentTestimonial.name}
                          />
                          <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                            {currentTestimonial.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <h3 className="font-bold text-lg">
                          {currentTestimonial.name}
                        </h3>
                        <p className="text-primary font-medium">
                          {currentTestimonial.role}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {currentTestimonial.school}
                        </p>

                        {/* Rating */}
                        <div className="flex justify-center gap-1 mt-3">
                          {Array.from({
                            length: currentTestimonial.rating,
                          }).map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>

                      {/* Testimonial */}
                      <div className="md:col-span-2">
                        <div className="relative">
                          <p className="text-lg leading-relaxed text-muted-foreground mb-4">
                            "{currentTestimonial.testimonial}"
                          </p>

                          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                            <Star className="h-3 w-3 fill-current" />
                            {currentTestimonial.highlight}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Controles de Navegação */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevious}
                className="h-10 w-10 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Indicadores */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "w-8 bg-primary"
                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
                className="h-10 w-10 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Estatísticas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          >
            <Card className="text-center p-6">
              <div className="text-3xl font-bold text-primary mb-2">150+</div>
              <div className="text-sm text-muted-foreground">
                Escolas Atendidas
              </div>
            </Card>

            <Card className="text-center p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
              <div className="text-sm text-muted-foreground">
                Satisfação dos Usuários
              </div>
            </Card>

            <Card className="text-center p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">85%</div>
              <div className="text-sm text-muted-foreground">
                Redução no Tempo de Agendamento
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

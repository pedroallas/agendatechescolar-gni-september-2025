import Link from "next/link";
import { LandingHeader } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { StatsSection } from "@/components/landing/stats-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features-section";
import { CalendarPreview } from "@/components/landing/calendar-preview";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FAQSection } from "@/components/landing/faq-section";
import { CTASection } from "@/components/landing/cta-section";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <HowItWorks />
        <FeaturesSection />
        <CalendarPreview />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <footer className="w-full border-t bg-muted/50">
        <div className="container py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <Logo size="lg" href="#" />
              <p className="text-sm text-muted-foreground">
                Modernizando a gestão de recursos escolares
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-foreground">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-primary">
                    Recursos
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-primary">
                    Como Funciona
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-primary">
                    Preços
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-foreground">Suporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#faq" className="hover:text-primary">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-primary">
                    Documentação
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-primary">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-primary">
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-primary">
                    Termos de Uso
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} AgendaTech Escolar. Todos os
              direitos reservados.
            </p>
          </div>
        </div>
      </footer>
      <WhatsAppButton />
    </div>
  );
}

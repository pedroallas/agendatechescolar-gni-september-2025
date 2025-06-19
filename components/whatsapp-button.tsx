"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
}

export function WhatsAppButton({
  phoneNumber = "5511999999999", // Número padrão - alterar para o número real
  message = "Olá! Preciso de ajuda com o AgendaTech Escolar.",
}: WhatsAppButtonProps) {
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.3 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        onClick={handleClick}
        size="lg"
        className="rounded-full h-14 w-14 bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300"
        aria-label="Abrir WhatsApp"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>

      {/* Tooltip animado */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.3 }}
        className="absolute right-16 top-1/2 -translate-y-1/2 bg-card border rounded-lg px-3 py-2 shadow-md whitespace-nowrap hidden md:block"
      >
        <span className="text-sm">Precisa de ajuda? Fale conosco!</span>
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-card"></div>
      </motion.div>
    </motion.div>
  );
}

// Versão simplificada sem animações
export function WhatsAppButtonSimple({
  phoneNumber = "5511999999999",
  message = "Olá! Preciso de ajuda com o AgendaTech Escolar.",
}: WhatsAppButtonProps) {
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
      aria-label="Abrir WhatsApp"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 fill-current"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 012.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-.32.09-1.99.52.52-1.93.12-.36-.23-.33a8.178 8.178 0 01-1.37-4.55c0-4.54 3.7-8.24 8.24-8.24h.03zm-2.07 5.84c-.16 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.39 1 2.56.12.17 1.76 2.67 4.25 3.73.59.25 1.05.4 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.25-.16-.52-.28-.28-.12-1.63-.8-1.88-.89-.25-.09-.43-.14-.61.13-.18.28-.7.89-.86 1.07-.16.18-.33.2-.61.07-.28-.12-1.18-.43-2.24-1.39-.83-.74-1.39-1.66-1.55-1.94-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.17.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.63-1.51-.86-2.07-.23-.55-.46-.48-.62-.49h-.52z" />
      </svg>
    </button>
  );
}

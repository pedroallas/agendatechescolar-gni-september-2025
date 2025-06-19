import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-config";

// Adicionar configuração de URL temporária
const authOptionsWithUrl = {
  ...authOptions,
  url: process.env.NEXTAUTH_URL || "http://localhost:3000",
};

const handler = NextAuth(authOptionsWithUrl);

export { handler as GET, handler as POST };

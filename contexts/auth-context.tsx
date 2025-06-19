"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const user = session?.user
    ? {
        id: session.user.id,
        name: session.user.name || "",
        email: session.user.email,
        role: session.user.role,
        image: session.user.image,
      }
    : null;

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Traduzir erros do NextAuth
        let errorMessage = "E-mail ou senha incorretos";

        if (result.error === "CredentialsSignin") {
          errorMessage = "E-mail ou senha incorretos";
        } else if (result.error === "Configuration") {
          errorMessage = "Erro de configuração do sistema";
        } else if (result.error === "AccessDenied") {
          errorMessage = "Acesso negado";
        }

        return { success: false, error: errorMessage };
      }

      return { success: true };
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return {
        success: false,
        error: "Ocorreu um erro ao processar seu login",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    await update();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: status === "loading" || isLoading,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

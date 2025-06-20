"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { useAuth } from "@/contexts/auth-context";
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Mail,
  Lock,
  Chrome,
  Github,
} from "lucide-react";

function LoginContent() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithGoogle, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const urlError = searchParams.get("error");

  // Traduzir erros do NextAuth que vêm pela URL
  const getErrorMessage = (error: string | null) => {
    if (!error) return null;

    switch (error) {
      case "CredentialsSignin":
        return "E-mail ou senha incorretos";
      case "OAuthSignin":
        return "Erro ao fazer login com provedor social";
      case "OAuthCallback":
        return "Erro no callback do provedor social";
      case "OAuthCreateAccount":
        return "Erro ao criar conta com provedor social";
      case "EmailCreateAccount":
        return "Erro ao criar conta com e-mail";
      case "Callback":
        return "Erro no callback de autenticação";
      case "OAuthAccountNotLinked":
        return "Este e-mail já está cadastrado com outro método de login";
      case "SessionRequired":
        return "Você precisa estar logado para acessar esta página";
      case "undefined":
        return "Erro ao processar login. Verifique suas credenciais.";
      default:
        return "Erro ao fazer login. Tente novamente.";
    }
  };

  const [error, setError] = useState<string | null>(getErrorMessage(urlError));

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    const result = await login(data.email, data.password);

    if (!result.success) {
      setError(result.error || "Erro ao fazer login");
      return;
    }

    router.push("/dashboard");
  };

  // Login Social
  const handleSocialLogin = async (provider: string) => {
    setError(null);
    try {
      if (provider === "Google") {
        await loginWithGoogle();
      } else {
        setError(`Login com ${provider} ainda não está disponível`);
      }
    } catch (error) {
      setError("Erro ao fazer login com " + provider);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Link>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Bem-vindo de volta
            </CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {registered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Cadastro realizado com sucesso! Faça login para continuar.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@gmail.com"
                    {...register("email")}
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className={`pl-10 pr-10 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!isValid || isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Ou continue com
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => handleSocialLogin("Google")}
                disabled={isLoading}
              >
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialLogin("Microsoft")}
                disabled
                className="relative"
              >
                <Github className="mr-2 h-4 w-4" />
                Microsoft
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-xs px-1 py-0.5 rounded text-black font-medium">
                  Em breve
                </span>
              </Button>
            </div>
          </CardContent>

          <CardFooter>
            <div className="text-center text-sm w-full">
              Não tem uma conta?{" "}
              <Link
                href="/register"
                className="text-primary hover:underline font-medium"
              >
                Cadastre-se agora
              </Link>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-4">
          Ao fazer login, você concorda com nossos{" "}
          <Link href="/terms" className="underline">
            termos de uso
          </Link>{" "}
          e{" "}
          <Link href="/privacy" className="underline">
            política de privacidade
          </Link>
          .
        </p>

        {/* Informação de teste - remover em produção */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
          <p className="font-semibold text-blue-900">🧪 Contas de teste:</p>
          <div className="mt-2 space-y-1 text-blue-700">
            <p>
              <span className="font-medium">Admin:</span> bomdia1295@gmail.com /
              admin123
            </p>
            <p>
              <span className="font-medium">Professor:</span>{" "}
              professor@escola.edu.br / user123
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LoginContent />
    </Suspense>
  );
}

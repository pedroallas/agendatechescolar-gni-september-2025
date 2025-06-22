import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Rotas que não precisam de autenticação
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/api/auth", // Todas as rotas do NextAuth
  "/api/resources", // Temporariamente público para landing page
  "/api/bookings", // Temporariamente público para landing page
];

// Função para verificar se a rota é pública
const isPublicRoute = (path: string) => {
  return publicRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Se for uma rota pública, permite o acesso
  if (isPublicRoute(path)) {
    return NextResponse.next();
  }

  // Verifica se o usuário está autenticado usando NextAuth
  const token = await getToken({
    req: request,
    // Tentar NEXTAUTH_SECRET primeiro, depois AUTH_SECRET como fallback
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  });

  if (!token) {
    // Redireciona para o login se não estiver autenticado
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verifica permissões para rotas administrativas
  if (
    path.startsWith("/dashboard/admin") &&
    token.role !== "diretor" &&
    token.role !== "coordenador"
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configuração para aplicar o middleware apenas nas rotas especificadas
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes que lidam com sua própria autenticação)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};

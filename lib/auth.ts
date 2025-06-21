import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function getUser(request?: NextRequest) {
  try {
    const secret =
      process.env.NEXTAUTH_SECRET || "desenvolvimento-temporario-123456789";

    // Se temos o request, usar diretamente
    if (request) {
      const token = await getToken({
        req: request,
        secret,
      });

      if (token && token.sub) {
        return {
          id: token.id || token.sub,
          email: token.email,
          name: token.name,
          role: token.role,
        };
      }
    } else {
      // Fallback para cookies
      try {
        const cookieStore = await cookies();
        const token = await getToken({
          req: {
            cookies: { get: (name: string) => cookieStore.get(name)?.value },
            headers: { cookie: cookieStore.toString() },
          } as any,
          secret,
        });

        if (token && token.sub) {
          return {
            id: token.id || token.sub,
            email: token.email,
            name: token.name,
            role: token.role,
          };
        }
      } catch (cookieError) {
        console.error("Erro ao ler cookies:", cookieError);
        // Continuar para tentar outras formas de autenticação
      }
    }

    return null;
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await getUser(request);

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return user;
}

export async function requireAdmin(request: NextRequest) {
  const user = await getUser(request);

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user.role !== "diretor" && user.role !== "coordenador") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return user;
}

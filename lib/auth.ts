import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function getUser() {
  try {
    // Tentar primeiro com NextAuth JWT
    const cookieStore = await cookies();
    const nextAuthToken =
      cookieStore.get("next-auth.session-token")?.value ||
      cookieStore.get("__Secure-next-auth.session-token")?.value;

    if (nextAuthToken) {
      // Usar getToken do NextAuth
      const token = await getToken({
        req: {
          cookies: { get: (name: string) => cookieStore.get(name)?.value },
        } as any,
        secret:
          process.env.NEXTAUTH_SECRET || "desenvolvimento-temporario-123456789",
      });

      if (token) {
        return {
          id: token.id || token.sub,
          email: token.email,
          name: token.name,
          role: token.role,
        };
      }
    }

    // Fallback para JWT personalizado (para compatibilidade)
    const customToken = cookieStore.get("token")?.value;

    if (!customToken) {
      return null;
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "fallback_secret"
    );
    const { payload } = await jwtVerify(customToken, secret);
    return payload;
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return user;
}

export async function requireAdmin(request: NextRequest) {
  const user = await getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user.role !== "diretor" && user.role !== "coordenador") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return user;
}

import { jwtVerify } from "jose"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function getUser() {
  const cookieStore = cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    return null
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret")
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    console.error("Erro ao verificar token:", error)
    return null
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return user
}

export async function requireAdmin(request: NextRequest) {
  const user = await getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (user.role !== "diretor" && user.role !== "coordenador") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return user
}

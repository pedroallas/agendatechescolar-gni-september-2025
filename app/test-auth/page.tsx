"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TestAuthPage() {
  const [email, setEmail] = useState("admin@escola.edu.br");
  const [password, setPassword] = useState("admin123");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      setResult(res);
    } catch (error: any) {
      setResult({ error: error.message || "Erro desconhecido" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>🧪 Teste de Autenticação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>

          <div>
            <Label>Senha</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
            />
          </div>

          <Button onClick={handleTest} disabled={loading} className="w-full">
            {loading ? "Testando..." : "Testar Login"}
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Resultado:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>

              {result.ok && !result.error && (
                <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
                  ✅ Login bem-sucedido!
                  <a href="/dashboard" className="ml-2 underline">
                    Ir para Dashboard
                  </a>
                </div>
              )}

              {result.error && (
                <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
                  ❌ Erro: {result.error}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded text-sm">
            <p className="font-semibold">ℹ️ Informações do teste:</p>
            <ul className="mt-2 space-y-1">
              <li>• Endpoint: /api/auth/callback/credentials</li>
              <li>• Provider: credentials</li>
              <li>• Database: SQLite (dev.db)</li>
              <li>• NextAuth configurado</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

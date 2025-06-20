"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  QrCode,
  Download,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";

interface QRCodeManagerProps {
  resourceId: string;
  resourceName: string;
  isAdmin?: boolean;
  className?: string;
}

export function QRCodeManager({
  resourceId,
  resourceName,
  isAdmin = false,
  className = "",
}: QRCodeManagerProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [resourceUrl, setResourceUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Verificar se é admin - se não for, não renderizar o componente
  if (!isAdmin) {
    return null;
  }

  // Gerar URL do recurso
  useEffect(() => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/resource/${resourceId}`;
    setResourceUrl(url);
  }, [resourceId]);

  // Gerar QR Code
  const generateQRCode = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/resources/${resourceId}/qrcode?format=dataurl&size=200`
      );
      if (response.ok) {
        const data = await response.json();
        setQrCodeUrl(data.qrCode);
        toast.success("QR Code gerado com sucesso!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao gerar QR Code");
      }
    } catch (error) {
      toast.error("Erro ao gerar QR Code");
    } finally {
      setLoading(false);
    }
  };

  // Salvar QR Code no banco
  const saveQRCode = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/resources/${resourceId}/qrcode`, {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setQrCodeUrl(data.qrCode);
        toast.success("QR Code salvo no banco de dados!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao salvar QR Code");
      }
    } catch (error) {
      toast.error("Erro ao salvar QR Code");
    } finally {
      setLoading(false);
    }
  };

  // Download QR Code como PNG
  const downloadQRCode = async () => {
    try {
      const response = await fetch(
        `/api/resources/${resourceId}/qrcode?format=png&size=400`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `qr-${resourceName.replace(/[^a-zA-Z0-9]/g, "-")}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("QR Code baixado!");
      } else {
        toast.error("Erro ao baixar QR Code");
      }
    } catch (error) {
      toast.error("Erro ao baixar QR Code");
    }
  };

  // Copiar URL
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(resourceUrl);
      setCopied(true);
      toast.success("URL copiada para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erro ao copiar URL");
    }
  };

  // Carregar QR Code existente ao montar componente
  useEffect(() => {
    generateQRCode();
  }, [resourceId]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <QrCode className="h-5 w-5 text-blue-600" />
          <span>QR Code do Recurso</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code Display */}
        <div className="text-center">
          {qrCodeUrl ? (
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block">
              <img
                src={qrCodeUrl}
                alt={`QR Code para ${resourceName}`}
                className="w-48 h-48 mx-auto"
              />
            </div>
          ) : (
            <div className="bg-gray-100 p-8 rounded-lg border-2 border-dashed border-gray-300">
              <QrCode className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">
                QR Code será gerado automaticamente
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={generateQRCode}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Gerar
            </Button>
            <Button
              onClick={downloadQRCode}
              disabled={loading || !qrCodeUrl}
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
          </div>

          <Button
            onClick={saveQRCode}
            disabled={loading}
            className="w-full"
            variant="secondary"
          >
            <QrCode className="h-4 w-4 mr-2" />
            Salvar no Banco
          </Button>
        </div>

        <Separator />

        {/* URL Info */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">URL do Recurso:</span>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 break-all mb-2">
              {resourceUrl}
            </p>
            <Button
              onClick={copyUrl}
              size="sm"
              variant="outline"
              className="w-full"
            >
              {copied ? (
                <Check className="h-4 w-4 mr-2 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? "Copiado!" : "Copiar URL"}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Como usar:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Baixe o QR Code e imprima como etiqueta</li>
            <li>• Cole no recurso físico</li>
            <li>• Usuários podem escanear para ver detalhes</li>
            <li>• QR Code leva à página pública do recurso</li>
          </ul>
        </div>

        {/* Preview Link */}
        <Button asChild variant="outline" className="w-full">
          <a href={resourceUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Visualizar Página Pública
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

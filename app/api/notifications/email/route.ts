import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { z } from "zod";

// Schema de validação para envio de email
const sendEmailSchema = z.object({
  to: z.string().email("Email inválido"),
  subject: z.string().min(1, "Assunto é obrigatório"),
  template: z.enum([
    "booking_confirmation",
    "booking_reminder",
    "booking_cancellation",
    "resource_approved",
    "maintenance_scheduled",
  ]),
  data: z.object({}).passthrough(), // Dados dinâmicos para o template
});

// Templates de email
const emailTemplates = {
  booking_confirmation: {
    subject: (data: any) => `Agendamento Confirmado - ${data.resourceName}`,
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">✅ Agendamento Confirmado</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <p style="font-size: 18px; color: #333;">Olá <strong>${data.userName}</strong>,</p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            Seu agendamento foi confirmado com sucesso! Aqui estão os detalhes:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="margin-top: 0; color: #333;">📋 Detalhes do Agendamento</h3>
            <p><strong>Recurso:</strong> ${data.resourceName}</p>
            <p><strong>Data:</strong> ${data.date}</p>
            <p><strong>Horário:</strong> ${data.timeBlock}</p>
            <p><strong>Finalidade:</strong> ${data.purpose}</p>
            <p><strong>Local:</strong> ${data.location}</p>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1976d2;">
              <strong>💡 Lembrete:</strong> Chegue com 10 minutos de antecedência e traga um documento de identificação.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.actionUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Ver Agendamento
            </a>
          </div>
        </div>
        
        <div style="background: #343a40; color: #adb5bd; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">AgendaTech - Sistema de Agendamento Escolar</p>
          <p style="margin: 5px 0 0 0;">Este é um email automático, não responda.</p>
        </div>
      </div>
    `,
  },

  booking_reminder: {
    subject: (data: any) =>
      `Lembrete: Agendamento amanhã - ${data.resourceName}`,
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ffc107 0%, #ff8f00 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">⏰ Lembrete de Agendamento</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <p style="font-size: 18px; color: #333;">Olá <strong>${data.userName}</strong>,</p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            Este é um lembrete sobre seu agendamento que acontecerá em breve:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="margin-top: 0; color: #333;">📋 Detalhes do Agendamento</h3>
            <p><strong>Recurso:</strong> ${data.resourceName}</p>
            <p><strong>Data:</strong> ${data.date}</p>
            <p><strong>Horário:</strong> ${data.timeBlock}</p>
            <p><strong>Local:</strong> ${data.location}</p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
            <p style="margin: 0; color: #856404;">
              <strong>⚠️ Importante:</strong> Não se esqueça do seu agendamento! Confirme sua presença.
            </p>
          </div>
        </div>
        
        <div style="background: #343a40; color: #adb5bd; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">AgendaTech - Sistema de Agendamento Escolar</p>
        </div>
      </div>
    `,
  },

  booking_cancellation: {
    subject: (data: any) => `Agendamento Cancelado - ${data.resourceName}`,
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">❌ Agendamento Cancelado</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <p style="font-size: 18px; color: #333;">Olá <strong>${
            data.userName
          }</strong>,</p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            Informamos que seu agendamento foi cancelado:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h3 style="margin-top: 0; color: #333;">📋 Agendamento Cancelado</h3>
            <p><strong>Recurso:</strong> ${data.resourceName}</p>
            <p><strong>Data:</strong> ${data.date}</p>
            <p><strong>Horário:</strong> ${data.timeBlock}</p>
            <p><strong>Motivo:</strong> ${data.reason || "Não informado"}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${
              data.actionUrl
            }" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Fazer Novo Agendamento
            </a>
          </div>
        </div>
        
        <div style="background: #343a40; color: #adb5bd; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">AgendaTech - Sistema de Agendamento Escolar</p>
        </div>
      </div>
    `,
  },

  resource_approved: {
    subject: (data: any) => `Recurso Aprovado - ${data.resourceName}`,
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">✅ Recurso Aprovado</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <p style="font-size: 18px; color: #333;">Olá <strong>${data.userName}</strong>,</p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            Temos uma ótima notícia! O recurso foi aprovado e está disponível para agendamento:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="margin-top: 0; color: #333;">🏫 Recurso Aprovado</h3>
            <p><strong>Nome:</strong> ${data.resourceName}</p>
            <p><strong>Tipo:</strong> ${data.resourceType}</p>
            <p><strong>Local:</strong> ${data.location}</p>
            <p><strong>Capacidade:</strong> ${data.capacity} pessoas</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.actionUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Ver Recurso
            </a>
          </div>
        </div>
        
        <div style="background: #343a40; color: #adb5bd; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">AgendaTech - Sistema de Agendamento Escolar</p>
        </div>
      </div>
    `,
  },

  maintenance_scheduled: {
    subject: (data: any) => `Manutenção Agendada - ${data.resourceName}`,
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🔧 Manutenção Agendada</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <p style="font-size: 18px; color: #333;">Olá <strong>${data.userName}</strong>,</p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            Informamos que foi agendada uma manutenção para o recurso:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6f42c1;">
            <h3 style="margin-top: 0; color: #333;">🔧 Detalhes da Manutenção</h3>
            <p><strong>Recurso:</strong> ${data.resourceName}</p>
            <p><strong>Tipo:</strong> ${data.maintenanceType}</p>
            <p><strong>Data:</strong> ${data.scheduledDate}</p>
            <p><strong>Descrição:</strong> ${data.description}</p>
          </div>
          
          <div style="background: #e2e3e5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #495057;">
              <strong>ℹ️ Nota:</strong> O recurso ficará indisponível durante o período de manutenção.
            </p>
          </div>
        </div>
        
        <div style="background: #343a40; color: #adb5bd; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">AgendaTech - Sistema de Agendamento Escolar</p>
        </div>
      </div>
    `,
  },
};

// Configurar transporter do Nodemailer
function createTransporter() {
  // Para desenvolvimento, usar Ethereal Email ou configurar SMTP real
  if (process.env.NODE_ENV === "development") {
    // Usar Ethereal Email para testes em desenvolvimento
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER || "ethereal.user@ethereal.email",
        pass: process.env.ETHEREAL_PASS || "ethereal.pass",
      },
    });
  } else {
    // Configuração para produção (Gmail, SendGrid, etc.)
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
}

// POST - Enviar email
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Apenas administradores podem enviar emails
    const isAdmin =
      user.role === "admin" ||
      user.role === "director" ||
      user.role === "diretor";
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Sem permissão para enviar emails" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = sendEmailSchema.parse(body);

    const template = emailTemplates[data.template];
    if (!template) {
      return NextResponse.json(
        { error: "Template não encontrado" },
        { status: 400 }
      );
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || "AgendaTech <noreply@agendatech.edu.br>",
      to: data.to,
      subject: template.subject(data.data),
      html: template.html(data.data),
    };

    const info = await transporter.sendMail(mailOptions);

    // Salvar log do email
    await prisma.emailLog.create({
      data: {
        userId: user.id as string,
        email: data.to,
        subject: mailOptions.subject,
        template: data.template,
        status: "sent",
        provider: "nodemailer",
        messageId: info.messageId,
        metadata: JSON.stringify(data.data),
      },
    });

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      preview:
        process.env.NODE_ENV === "development"
          ? nodemailer.getTestMessageUrl(info)
          : null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao enviar email:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

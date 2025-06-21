import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        bookings: {
          include: {
            resource: true,
            timeBlock: true,
          },
        },
        ratings: {
          include: {
            resource: true,
          },
        },
        maintenanceReports: {
          include: {
            resource: true,
          },
        },
        supportTickets: {
          include: {
            resource: true,
          },
        },
        notifications: true,
        sentMessages: {
          include: {
            recipient: {
              select: { name: true, email: true },
            },
          },
        },
        receivedMessages: {
          include: {
            sender: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Remover dados sensíveis
    const exportData = {
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      bookings: user.bookings.map((booking) => ({
        id: booking.id,
        date: booking.date,
        purpose: booking.purpose,
        status: booking.status,
        isRecurring: booking.isRecurring,
        resource: {
          name: booking.resource.name,
          type: booking.resource.type,
          location: booking.resource.location,
        },
        timeBlock: {
          startTime: booking.timeBlock.startTime,
          endTime: booking.timeBlock.endTime,
          label: booking.timeBlock.label,
        },
        createdAt: booking.createdAt,
      })),
      ratings: user.ratings.map((rating) => ({
        id: rating.id,
        rating: rating.rating,
        comment: rating.comment,
        resource: {
          name: rating.resource.name,
          type: rating.resource.type,
        },
        createdAt: rating.createdAt,
      })),
      maintenanceReports: user.maintenanceReports.map((report) => ({
        id: report.id,
        type: report.type,
        priority: report.priority,
        status: report.status,
        description: report.description,
        resource: {
          name: report.resource.name,
          type: report.resource.type,
        },
        reportedAt: report.reportedAt,
      })),
      supportTickets: user.supportTickets.map((ticket) => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        resource: ticket.resource
          ? {
              name: ticket.resource.name,
              type: ticket.resource.type,
            }
          : null,
        createdAt: ticket.createdAt,
      })),
      notifications: user.notifications.map((notification) => ({
        id: notification.id,
        title: notification.title,
        content: notification.content,
        type: notification.type,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      })),
      messages: {
        sent: user.sentMessages.map((message) => ({
          id: message.id,
          subject: message.subject,
          content: message.content,
          recipient: message.recipient.name,
          sentAt: message.createdAt,
        })),
        received: user.receivedMessages.map((message) => ({
          id: message.id,
          subject: message.subject,
          content: message.content,
          sender: message.sender.name,
          receivedAt: message.createdAt,
          isRead: message.isRead,
        })),
      },
      exportedAt: new Date().toISOString(),
    };

    // Criar resposta com headers para download
    const jsonData = JSON.stringify(exportData, null, 2);

    return new NextResponse(jsonData, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="dados-usuario-${
          user.id
        }-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Erro ao exportar dados:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

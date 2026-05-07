import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        field: true,
      },
    });

    if (!booking) {
      return new NextResponse("Booking not found", {
        status: 404,
      });
    }

    const html = `
      <html>
        <head>
          <title>SportBook E-Ticket</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f5f5f5;
              padding: 40px;
            }

            .card {
              max-width: 600px;
              margin: auto;
              background: white;
              border-radius: 16px;
              padding: 30px;
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }

            h1 {
              color: #1E3A8A;
              margin-bottom: 20px;
            }

            p {
              font-size: 16px;
              margin: 10px 0;
            }

            .status {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 8px;
              background: #DCFCE7;
              color: #166534;
              font-weight: bold;
            }
          </style>
        </head>

        <body>
          <div class="card">
            <h1>SPORTBOOK E-TICKET</h1>

            <p><b>Nama:</b> ${booking.user?.name ?? "-"}</p>
            <p><b>Email:</b> ${booking.user?.email ?? "-"}</p>
            <p><b>Lapangan:</b> ${booking.field?.name ?? "-"}</p>
            <p><b>Tanggal:</b> ${booking.date.toISOString().slice(0, 10)}</p>
            <p><b>Jam:</b> ${booking.timeStart} - ${booking.timeEnd}</p>

            <p>
              <b>Status:</b>
              <span class="status">${booking.status}</span>
            </p>

            <p><b>Booking ID:</b> ${booking.id}</p>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (err) {
    console.error("❌ E-Ticket Error:", err);

    return NextResponse.json(
      { error: "Failed to generate E-Ticket" },
      { status: 500 }
    );
  }
}
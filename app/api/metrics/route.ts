import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";



export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { weight, muscleMass, bodyFat } = body;

    const metric = await prisma.bodyMetric.create({
      data: {
        userId,
        weight: weight ? parseFloat(weight) : null,
        muscleMass: muscleMass ? parseFloat(muscleMass) : null,
        bodyFat: bodyFat ? parseFloat(bodyFat) : null,
      },
    });

    return NextResponse.json({ message: "Metrics added successfully", metric }, { status: 201 });
  } catch (error) {
    console.error("Metrics add error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const metrics = await prisma.bodyMetric.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 1, // Only get the latest
    });

    return NextResponse.json({ latestMetric: metrics[0] || null }, { status: 200 });
  } catch (error) {
    console.error("Metrics fetch error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

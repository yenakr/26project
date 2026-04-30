import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { routineName, durationMins } = body;

    const log = await prisma.workoutLog.create({
      data: {
        userId,
        routineName,
        durationMins: durationMins ? parseInt(durationMins) : null,
      },
    });

    return NextResponse.json({ message: "Log created successfully", log }, { status: 201 });
  } catch (error) {
    console.error("Workout log create error:", error);
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
    const logs = await prisma.workoutLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error("Workout log fetch error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

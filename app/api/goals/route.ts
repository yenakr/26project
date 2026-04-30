import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { targetWeight, targetMuscleMass, targetBodyFat } = body;

    const goal = await prisma.goal.upsert({
      where: { userId },
      update: {
        targetWeight: targetWeight ? parseFloat(targetWeight) : null,
        targetMuscleMass: targetMuscleMass ? parseFloat(targetMuscleMass) : null,
        targetBodyFat: targetBodyFat ? parseFloat(targetBodyFat) : null,
      },
      create: {
        userId,
        targetWeight: targetWeight ? parseFloat(targetWeight) : null,
        targetMuscleMass: targetMuscleMass ? parseFloat(targetMuscleMass) : null,
        targetBodyFat: targetBodyFat ? parseFloat(targetBodyFat) : null,
      },
    });

    return NextResponse.json({ message: "Goal updated successfully", goal }, { status: 200 });
  } catch (error) {
    console.error("Goal update error:", error);
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
    const goal = await prisma.goal.findUnique({
      where: { userId },
    });

    return NextResponse.json({ goal }, { status: 200 });
  } catch (error) {
    console.error("Goal fetch error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

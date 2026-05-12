import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      patientAge, 
      patientGender, 
      situation, 
      background, 
      bp, 
      hr, 
      spo2, 
      nrs, 
      recommendation, 
      preKtas,
      logs 
    } = body;

    const record = await prisma.emergencyRecord.create({
      data: {
        userId: (session.user as any).id,
        patientAge,
        patientGender,
        situation,
        background,
        bp,
        hr,
        spo2,
        nrs,
        recommendation,
        preKtas,
        logs: logs, // Store JSON audit logs
      },
    });

    return NextResponse.json(record);
  } catch (error: any) {
    console.error("RECORD_SAVE_ERROR", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const records = await prisma.emergencyRecord.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(records);
  } catch (error: any) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

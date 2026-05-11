import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const record = await prisma.emergencyRecord.create({
      data: {
        patientAge: body.patientAge,
        patientGender: body.patientGender,
        situation: body.situation,
        background: body.background,
        bp: body.bp,
        hr: body.hr,
        spo2: body.spo2,
        nrs: body.nrs,
        recommendation: body.recommendation,
        preKtas: body.preKtas,
        userId: body.userId || null,
      },
    });

    return NextResponse.json(record);
  } catch (error: any) {
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const records = await prisma.emergencyRecord.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(records);
  } catch (error: any) {
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}

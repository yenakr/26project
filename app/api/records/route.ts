import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { 
      patientAge, patientGender, situation, background, bp, hr, spo2, nrs, recommendation, preKtas, logs 
    } = body;

    const record = await prisma.emergencyRecord.create({
      data: {
        userId: session.user.id,
        patientAge: patientAge || "N/A",
        patientGender: patientGender || "Unknown",
        situation: situation || "",
        background: background || "",
        bp: bp || "",
        hr: hr || "",
        spo2: spo2 || "",
        nrs: nrs || "",
        recommendation: recommendation || "",
        preKtas: preKtas || "N/A",
        logs: Array.isArray(logs) ? logs : [],
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    console.error("POST_RECORD_ERROR", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: true, records: [] });
    }

    const records = await prisma.emergencyRecord.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const safeRecords = records.map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return NextResponse.json({ success: true, records: safeRecords });
  } catch (error: any) {
    console.error("GET_RECORDS_ERROR", error);
    return NextResponse.json({ success: false, error: "Internal Server Error", records: [] }, { status: 500 });
  }
}

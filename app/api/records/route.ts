import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let userId = session.user.id;
    
    // Fallback: if id is missing but email exists, find the user
    if (!userId && session.user.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (user) userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID not found in session" }, { status: 401 });
    }

    console.log("DEBUG_FINAL_USER_ID:", userId);

    const body = await request.json().catch(() => ({}));
    console.log("DEBUG_POST_BODY:", JSON.stringify(body, null, 2));

    const { 
      patientAge, patientGender, situation, background, bp, hr, spo2, nrs, recommendation, preKtas, logs 
    } = body;

    const record = await prisma.emergencyRecord.create({
      data: {
        userId: userId,
        patientAge: String(patientAge || "N/A"),
        patientGender: String(patientGender || "Unknown"),
        situation: String(situation || ""),
        background: String(background || ""),
        bp: String(bp || ""),
        hr: String(hr || ""),
        spo2: String(spo2 || ""),
        nrs: String(nrs || ""),
        recommendation: String(recommendation || ""),
        preKtas: String(preKtas || "N/A"),
        logs: Array.isArray(logs) ? logs : [],
      },
    });

    console.log("SAVE_SUCCESS_ID:", record.id);
    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    console.error("CRITICAL_POST_ERROR:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Internal Server Error",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
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
    }));

    return NextResponse.json({ success: true, records: safeRecords });
  } catch (error: any) {
    console.error("GET_RECORDS_ERROR", error);
    return NextResponse.json({ success: false, error: "Internal Server Error", records: [] }, { status: 500 });
  }
}

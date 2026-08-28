import { NextRequest, NextResponse } from "next/server";
import { parseReceiptText } from "@/lib/ai-pipeline/receipt-parser";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "No receipt text provided." },
        { status: 400 }
      );
    }

    if (text.length > 25000) {
      return NextResponse.json(
        { success: false, error: "Text is too long. Please paste only the relevant booking details." },
        { status: 413 }
      );
    }

    const parsedData = await parseReceiptText(text);

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Receipt Import API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error while parsing receipt" },
      { status: 500 }
    );
  }
}

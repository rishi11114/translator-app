// src/app/api/translate/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { text, input_lang, target_lang } = await request.json();

    // Use the unofficial Google Translate endpoint.
    // Pass the detected input language instead of assuming auto-detection.
    const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${input_lang}&tl=${target_lang}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }
    
    const data = await response.json();
    // Extract translated text from the nested response array.
    const translatedText =
      data[0]?.map((item: string[]) => item[0]).join('') || text;
    
    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json(
      { error: "Translation service unavailable. Please try again later." },
      { status: 500 }
    );
  }
}

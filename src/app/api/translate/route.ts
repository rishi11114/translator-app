import { NextResponse } from "next/server";

// Define a type for a single translation segment returned by the API.
// Each segment is an array where the first element is the translated text.
type TranslationSegment = [translatedText: string, originalText: string, ...rest: unknown[]];

// The overall API response is an array whose first element is an array of segments.
type GoogleTranslateResponse = [TranslationSegment[], ...unknown[]];

// Define the expected shape of the incoming POST request body.
interface RequestBody {
  text: string;
  input_lang: string;
  target_lang: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    // Parse the JSON request body and enforce its type.
    const { text, input_lang, target_lang } = (await request.json()) as RequestBody;

    // Read the base URL from an environment variable.
    const baseUrl = process.env.GOOGLE_TRANSLATE_API_URL;
    if (!baseUrl) {
      throw new Error("Google Translate API URL is not defined in environment variables.");
    }

    // Construct the full API URL with query parameters.
    const apiUrl = `${baseUrl}&sl=${input_lang}&tl=${target_lang}&dt=t&q=${encodeURIComponent(text)}`;

    // Fetch data from the translation API.
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    // Parse the response as JSON and cast it to the expected structure.
    const data = (await response.json()) as GoogleTranslateResponse;
    const segments: TranslationSegment[] = data[0] || [];

    // Extract and concatenate the translated text from each segment.
    const translatedText = segments.map(segment => segment[0]).join('') || text;

    // Return the translated text.
    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json(
      { error: "Translation service unavailable. Please try again later." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

// ---------------------------------------------------------
// CONFIG: Replace this with your actual n8n Webhook URL
// Or better, put it in your .env file as N8N_AUDIT_WEBHOOK
// ---------------------------------------------------------
const N8N_WEBHOOK_URL = process.env.N8N_AUDIT_WEBHOOK || "https://n8n-pro-775604255858.asia-south1.run.app/webhook/analyze-gmb";

export async function POST(req: Request) {
  try {
    // 1. Parse the incoming data from the Frontend
    const body = await req.json();
    const { myBusiness, competitors, keyword, userDetails } = body;

    // 2. Validate data
    if (!myBusiness || !competitors || competitors.length === 0) {
      return NextResponse.json(
        { error: "Validation Error: Missing Business or Competitor Data." },
        { status: 400 }
      );
    }

    // 3. Check if n8n URL is set
    if (!N8N_WEBHOOK_URL || N8N_WEBHOOK_URL.includes("YOUR_N8N")) {
      console.error("❌ Critical: N8N_AUDIT_WEBHOOK is missing.");
      return NextResponse.json(
        { error: "Configuration Error: n8n Webhook URL is not set in the server." },
        { status: 500 }
      );
    }

    // 4. Forward the data to n8n (The AI Agent)
    console.log("🚀 Sending data to n8n AI Agent...");
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        myBusiness,
        competitors,

        keyword,
        location: "India",
        userDetails,
      }),
    });

    // 5. Handle n8n Errors
    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error(`❌ n8n Error (${n8nResponse.status}):`, errorText);
      return NextResponse.json(
        { error: `AI Agent Failed: ${n8nResponse.statusText}` },
        { status: n8nResponse.status }
      );
    }

    // 6. Return the AI Analysis to the Frontend
    const responseText = await n8nResponse.text();
    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch (e) {
      console.error("❌ Failed to parse n8n response as JSON:", responseText);
      return NextResponse.json(
        { error: "Invalid JSON response from AI Agent", details: responseText.substring(0, 500) },
        { status: 502 }
      );
    }

  } catch (error: any) {
    console.error("❌ Server Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error during Analysis." },
      { status: 500 }
    );
  }
}
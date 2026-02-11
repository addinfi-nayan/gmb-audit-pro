import { NextResponse } from "next/server";
import axios from "axios";



export async function POST(request: Request) {
  try {
    const body = await request.json();

    // DEBUGGING LOGS (Check your VS Code Terminal for these!)
    console.log("--- DEBUG START ---");
    console.log("1. Received Keyword:", body.keyword);

    const n8nUrl = process.env.N8N_SEARCH_WEBHOOK_URL || "https://n8n-pro-775604255858.asia-south1.run.app/webhook/search-gmb";
    console.log("2. Using n8n URL:", n8nUrl ? "URL Found ✅" : "URL IS MISSING ❌");

    if (!n8nUrl) {
      console.error("CRITICAL ERROR: The .env variable is missing or undefined.");
      return NextResponse.json({ error: "Missing Webhook URL" }, { status: 500 });
    }

    console.log("3. Sending request to n8n...");
    const response = await axios.post(n8nUrl, { ...body, location: "India" });

    console.log("4. Success! n8n replied.");
    return NextResponse.json(response.data);

  } catch (error: any) {
    // This prints the REAL error message
    console.error("--- ERROR DETAILS ---");
    console.error(error.message);
    if (error.response) {
      console.error("n8n Response Data:", error.response.data);
      console.error("n8n Status:", error.response.status);
    }
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
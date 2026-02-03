import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/authOptions"; // Ensure path is correct
import axios from "axios";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get the Account ID first
    const accountRes = await axios.get(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    );

    const accountName = accountRes.data.accounts[0].name; // e.g., "accounts/123456"

    // 2. Get the Locations for that Account
    const locationsRes = await axios.get(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,storeCode,languageCode,phoneNumbers,categories,storefrontAddress,websiteUri,regularHours`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    );

    const locations = locationsRes.data.locations || [];
    
    return NextResponse.json({ locations });

  } catch (error: any) {
    console.error("GMB Fetch Error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}
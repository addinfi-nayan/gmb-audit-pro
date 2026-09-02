import { NextResponse } from "next/server";
import axios from "axios";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await getSupabaseServerClient();

  // Verify identity first (getUser() re-checks with Supabase's auth server),
  // then pull provider_token off the session — provider_token only lives on
  // the session object, not on the getUser() result.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.provider_token;
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get the Account ID first
    const accountRes = await axios.get(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const accountName = accountRes.data.accounts[0].name; // e.g., "accounts/123456"

    // 2. Get the Locations for that Account
    const locationsRes = await axios.get(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,storeCode,languageCode,phoneNumbers,categories,storefrontAddress,websiteUri,regularHours`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const locations = locationsRes.data.locations || [];

    return NextResponse.json({ locations });

  } catch (error: any) {
    console.error("GMB Fetch Error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}

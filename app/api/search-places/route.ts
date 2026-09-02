import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";

function logSearch(place: any) {
    if (!place) return;
    const name = place.displayName?.text || "";
    const phoneDigits = (place.nationalPhoneNumber || "").toString().replace(/\D/g, "").slice(-10);
    const phone = phoneDigits ? `+91${phoneDigits}` : "";

    getSupabaseAdminClient()
        .from("search_logs")
        .insert({ name, phone, website: place.websiteUri || "" })
        .then(({ error }: { error: any }) => {
            if (error) console.error("Search log insert error:", error);
        });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const keyword = body?.keyword;

        if (!keyword || typeof keyword !== "string") {
            return NextResponse.json({ error: "Missing 'keyword' in request body." }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        if (!apiKey) {
            console.error("CRITICAL ERROR: GOOGLE_PLACES_API_KEY is not set.");
            return NextResponse.json({ error: "Configuration Error: GOOGLE_PLACES_API_KEY is not set on the server." }, { status: 500 });
        }

        const placesRes = await fetch(PLACES_SEARCH_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount",
            },
            body: JSON.stringify({
                textQuery: keyword,
                regionCode: "IN",
                languageCode: "en",
            }),
        });

        const data = await placesRes.json();

        if (!placesRes.ok) {
            console.error("Google Places error:", data);
            return NextResponse.json({ error: "Search failed", details: data }, { status: placesRes.status });
        }

        // Fire-and-forget analytics log of the top result
        logSearch(data.places?.[0]);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Search error:", error?.message || error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}

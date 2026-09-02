import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, phone, business, coupon } = body;

        if (!email && !phone) {
            return NextResponse.json({ error: "Missing lead contact info." }, { status: 400 });
        }

        const phoneDigits = (phone || "").toString().replace(/\D/g, "").slice(-10);
        const normalizedPhone = phoneDigits ? `+91${phoneDigits}` : "";

        try {
            const supabase = getSupabaseAdminClient();
            await supabase.from("leads").insert({
                business: business || "",
                email: email || "",
                phone: normalizedPhone,
                coupon: coupon || null,
            });
        } catch (dbErr) {
            // Lead logging is best-effort — never block the user's unlock/payment flow on it.
            console.error("Lead insert error:", dbErr);
        }

        return NextResponse.json({ status: "success", message: "Lead captured" });
    } catch (error: any) {
        console.error("Save lead error:", error?.message || error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

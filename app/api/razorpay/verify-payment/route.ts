import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        const key_secret = process.env.RAZORPAY_KEY_SECRET!;

        const hmac = crypto.createHmac("sha256", key_secret);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest("hex");

        if (generated_signature === razorpay_signature) {
            return NextResponse.json({ mssg: "payment success", success: true }, { status: 200 });
        } else {
            return NextResponse.json(
                { mssg: "payment verification failed", success: false },
                { status: 400 }
            );
        }
    } catch (err: any) {
        console.log(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

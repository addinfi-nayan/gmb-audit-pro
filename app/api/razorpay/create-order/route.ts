import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        const payment_capture = 1;
        const amount = parseInt(process.env.RAZORPAY_PRICE_AMOUNT || "499");
        const currency = "INR";
        const options = {
            amount: (amount * 100).toString(),
            currency,
            receipt: Math.random().toString(36).substring(7),
            payment_capture,
        };

        const order = await razorpay.orders.create(options);
        return NextResponse.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
            key_id: process.env.RAZORPAY_KEY_ID,
        });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

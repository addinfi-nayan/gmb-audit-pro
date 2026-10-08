import React from "react";
import type { Metadata } from "next";
import PolicyLayout from "../../components/PolicyLayout";

export const metadata: Metadata = {
    title: "Cancellation & Refund Policy",
    description: "Cancellation and refund policy for WhatMyRank GMB audit reports by Addinfi Digitech Pvt. Ltd.",
    alternates: { canonical: "/refund-policy" },
};

const RefundPolicy = () => {
    return (
        <PolicyLayout title="Cancellation & Refund Policy">
            <section className="space-y-4">
                <p className="font-mono text-blue-600 text-xs uppercase tracking-widest">Effective Date: 20th February 2026</p>
                <div className="h-px bg-slate-50 w-full"></div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    Subscription Cancellation
                </h2>
                <p>Users may cancel their subscription at any time through their account dashboard or by contacting support. Cancellation will stop future billing cycles.</p>
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl mt-4">
                    <p className="text-sm font-medium">To cancel, please follow these steps:</p>
                    <ol className="list-decimal pl-6 mt-2 space-y-1 text-sm text-slate-600">
                        <li>Log in to your WhatMyRank account.</li>
                        <li>Navigate to the "Subscription" or "Account Settings" section.</li>
                        <li>Follow the on-screen instructions to cancel.</li>
                    </ol>
                    <p className="text-xs mt-4 text-slate-500">Alternatively, you can email our support team for assistance.</p>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-red-500 rounded-full shadow-sm"></span>
                    No Refund Policy
                </h2>
                <p>All payments made to WhatMyRank are final, non-refundable, and non-transferable.</p>
                <div className="bg-red-50 border border-red-200 p-6 rounded-xl mt-4">
                    <p className="text-sm font-bold text-red-600 mb-2 uppercase tracking-widest">We do not offer refunds for:</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <li className="flex items-center gap-2"><span className="text-red-600">✕</span> Partial usage</li>
                        <li className="flex items-center gap-2"><span className="text-red-600">✕</span> Dissatisfaction</li>
                        <li className="flex items-center gap-2"><span className="text-red-600">✕</span> Business outcome expectations</li>
                        <li className="flex items-center gap-2"><span className="text-red-600">✕</span> Unused subscription period</li>
                    </ul>
                </div>
                <p className="text-sm italic">By purchasing our services, users agree to this no-refund policy at the time of transaction.</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-amber-500 rounded-full shadow-sm"></span>
                    Implementation Disclaimer
                </h2>
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl">
                    <p className="text-sm leading-relaxed">
                        All changes suggested in our audit reports are to be implemented by the user <span className="text-amber-600 font-bold">only if they deem them applicable</span>.
                        Any such changes are made at the <span className="text-slate-900 font-bold">user's sole risk</span>.
                        Addinfi shall not be held responsible for any positive or negative outcomes resulting from these implementations.
                    </p>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    Exceptional Circumstances
                </h2>
                <p>In rare cases of duplicate billing or technical payment errors, users may contact support within <span className="text-slate-900 font-bold px-2 py-0.5 bg-slate-50 border border-slate-200 rounded">7 days</span> of the transaction.</p>
                <p>Resolution, if applicable, will be at the sole discretion of Addinfi. We promise to investigate every legitimate claim fairly and transparently.</p>
            </section>

            <section className="mt-12 p-8 rounded-2xl bg-white border border-slate-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -z-10 group-hover:bg-blue-50 transition-colors"></div>
                <h2 className="text-xl font-bold text-slate-900 mb-4 uppercase tracking-widest">Need Assistance?</h2>
                <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">If you are experiencing any technical issues or have questions regarding your billing, please don't hesitate to reach out. We're here to help.</p>

                <div className="mt-8">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Email</span>
                        <a href="mailto:info@addinfi.com" className="text-blue-600 font-mono hover:underline">info@addinfi.com</a>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-200 space-y-2">
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Registered Office:</p>
                    <p className="text-xs text-slate-600 font-mono">25, Saikrupa Swagruha Society, Manish Nagar, Nagpur</p>
                    <p className="text-[10px] text-slate-500 font-mono">Monday – Friday, 10:00 AM – 6:00 PM IST</p>
                </div>
            </section>
        </PolicyLayout>
    );
};

export default RefundPolicy;

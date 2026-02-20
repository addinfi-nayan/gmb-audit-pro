"use client";
import React from "react";
import PolicyLayout from "../../components/PolicyLayout";

const RefundPolicy = () => {
    return (
        <PolicyLayout title="Cancellation & Refund Policy">
            <section className="space-y-4">
                <p className="font-mono text-cyan-400 text-xs uppercase tracking-widest">Effective Date: 20th February 2026</p>
                <div className="h-px bg-white/5 w-full"></div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    Subscription Cancellation
                </h2>
                <p>Users may cancel their subscription at any time through their account dashboard or by contacting support. Cancellation will stop future billing cycles.</p>
                <div className="bg-white/5 border border-white/10 p-6 rounded-xl mt-4">
                    <p className="text-sm font-medium">To cancel, please follow these steps:</p>
                    <ol className="list-decimal pl-6 mt-2 space-y-1 text-sm text-gray-400">
                        <li>Log in to your WhatMyRank account.</li>
                        <li>Navigate to the "Subscription" or "Account Settings" section.</li>
                        <li>Follow the on-screen instructions to cancel.</li>
                    </ol>
                    <p className="text-xs mt-4 text-gray-500">Alternatively, you can email our support team for assistance.</p>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
                    No Refund Policy
                </h2>
                <p>All payments made to WhatMyRank are final, non-refundable, and non-transferable.</p>
                <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-xl mt-4">
                    <p className="text-sm font-bold text-red-400 mb-2 uppercase tracking-widest">We do not offer refunds for:</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <li className="flex items-center gap-2"><span className="text-red-500">✕</span> Partial usage</li>
                        <li className="flex items-center gap-2"><span className="text-red-500">✕</span> Dissatisfaction</li>
                        <li className="flex items-center gap-2"><span className="text-red-500">✕</span> Business outcome expectations</li>
                        <li className="flex items-center gap-2"><span className="text-red-500">✕</span> Unused subscription period</li>
                    </ul>
                </div>
                <p className="text-sm italic">By purchasing our services, users agree to this no-refund policy at the time of transaction.</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    Exceptional Circumstances
                </h2>
                <p>In rare cases of duplicate billing or technical payment errors, users may contact support within <span className="text-white font-bold px-2 py-0.5 bg-white/5 border border-white/10 rounded">7 days</span> of the transaction.</p>
                <p>Resolution, if applicable, will be at the sole discretion of Addinfi. We promise to investigate every legitimate claim fairly and transparently.</p>
            </section>

            <section className="mt-12 p-8 rounded-2xl bg-[#0B1120] border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/10 transition-colors"></div>
                <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest">Need Assistance?</h2>
                <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">If you are experiencing any technical issues or have questions regarding your billing, please don't hesitate to reach out. We're here to help.</p>

                <div className="mt-8 grid md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Main Email</span>
                        <a href="mailto:info@addinfi.com" className="text-cyan-400 font-mono hover:underline">info@addinfi.com</a>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Technical/Billing Support</span>
                        <a href="mailto:ads@addinfi.com" className="text-cyan-400 font-mono hover:underline">ads@addinfi.com</a>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 space-y-2">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Registered Office:</p>
                    <p className="text-xs text-gray-400 font-mono">25, Saikrupa Swagruha Society, Manish Nagar, Nagpur</p>
                    <p className="text-[10px] text-gray-600 font-mono">Monday – Friday, 10:00 AM – 6:00 PM IST</p>
                </div>
            </section>
        </PolicyLayout>
    );
};

export default RefundPolicy;

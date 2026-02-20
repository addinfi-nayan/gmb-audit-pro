"use client";
import React from "react";
import PolicyLayout from "../../components/PolicyLayout";

const TermsAndConditions = () => {
    return (
        <PolicyLayout title="Terms & Conditions">
            <section className="space-y-4">
                <p className="font-mono text-cyan-400 text-xs uppercase tracking-widest">Effective Date: 20th February 2026</p>
                <div className="h-px bg-white/5 w-full"></div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    1. Introduction
                </h2>
                <p>Welcome to WhatMyRank (“Platform”, “Website”, “Service”), a product developed and owned by Addinfi (“Company”, “We”, “Our”, “Us”).</p>
                <p>By accessing or using this website and its services, you agree to be bound by these Terms and Conditions. If you do not agree, you must not use this platform.</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    2. Nature of Service
                </h2>
                <p>WhatMyRank provides data insights, analytics tools, ranking information, and related digital analysis services.</p>
                <p>The information provided:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Is generated through automated systems and third-party data sources.</li>
                    <li>Is intended strictly for informational and research purposes.</li>
                    <li>Should NOT be considered final, verified, or legally binding data.</li>
                </ul>
                <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl mt-4">
                    <h3 className="text-red-400 font-bold mb-2 uppercase text-sm tracking-widest">Important Disclaimer</h3>
                    <p className="text-sm">Users must not completely rely on the data provided by this platform.</p>
                    <p className="text-sm mt-2">We strongly recommend that users conduct their own independent verification, research, and validation before making any business, financial, marketing, or strategic decisions.</p>
                    <p className="text-sm mt-2 font-bold">Addinfi shall not be liable for any losses, damages, or consequences arising from reliance on the data provided.</p>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    3. No Professional Advice
                </h2>
                <p>Nothing on this platform constitutes:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Legal advice</li>
                    <li>Financial advice</li>
                    <li>Marketing guarantees</li>
                    <li>Investment advice</li>
                    <li>Business outcome guarantees</li>
                </ul>
                <p>All decisions taken based on this platform are at the user’s sole discretion and risk.</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    4. Third-Party Platforms Disclaimer
                </h2>
                <p>This website may reference third-party platforms including but not limited to:</p>
                <ul className="list-disc pl-6 space-y-2 text-blue-400 font-medium">
                    <li>Google</li>
                    <li>Meta (Facebook/Instagram)</li>
                </ul>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl mt-4">
                    <h3 className="text-gray-200 font-bold mb-2 uppercase text-sm tracking-widest">Trademark & Endorsement Disclaimer</h3>
                    <p className="text-sm">This site is not part of the Meta website or Meta Inc. Additionally, this site is NOT endorsed by Meta in any way. META™ is a trademark of META, Inc.</p>
                    <p className="text-sm mt-2">This site is not part of the Google website or Google LLC. Additionally, this site is NOT endorsed by Google in any way. Google™ is a trademark of Google LLC.</p>
                    <p className="text-sm mt-2">All trademarks, brand names, and logos belong to their respective owners.</p>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    5. Accuracy of Information
                </h2>
                <p>While we strive to provide accurate and updated data:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>We do not guarantee completeness, accuracy, reliability, or timeliness.</li>
                    <li>Rankings and insights may vary due to algorithm changes, API updates, or platform modifications.</li>
                    <li>Data may be delayed, estimated, or sampled.</li>
                    <li>Testimonials and downloads data shown on Website is for marketing purposes only, not to be considered as real data.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    6. Limitation of Liability
                </h2>
                <p>To the fullest extent permitted by law: Addinfi and its team shall not be liable for direct losses, indirect losses, business interruption, loss of revenue, loss of profits, data loss, or strategic decision errors arising from use or inability to use the platform.</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    7. User Responsibilities
                </h2>
                <p>By using this platform, you agree:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Not to misuse, scrape, reverse engineer, or replicate the system.</li>
                    <li>Not to use data for unlawful or unethical purposes.</li>
                    <li>Not to hold Addinfi liable for business decisions made using this tool.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    8. Intellectual Property
                </h2>
                <p>All content, software, UI elements, tools, and proprietary systems belong to Addinfi. Unauthorized copying, redistribution, or duplication is strictly prohibited.</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    9. Modification of Terms
                </h2>
                <p>We reserve the right to modify these Terms at any time without prior notice. Continued usage after updates constitutes acceptance.</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    10. Governing Law
                </h2>
                <p>These Terms shall be governed by and interpreted in accordance with the laws of India. Any disputes shall fall under the jurisdiction of courts located in Nagpur, Maharashtra, India.</p>
            </section>

            <section className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/20">
                <h2 className="text-xl font-bold text-white mb-4">Questions?</h2>
                <p className="text-sm text-gray-400">If you have any questions regarding these Terms & Conditions, please contact us at <a href="mailto:info@addinfi.com" className="text-cyan-400 hover:underline">info@addinfi.com</a>.</p>
            </section>
        </PolicyLayout>
    );
};

export default TermsAndConditions;

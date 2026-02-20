"use client";
import React from "react";
import PolicyLayout from "../../components/PolicyLayout";

const PrivacyPolicy = () => {
    return (
        <PolicyLayout title="Privacy Policy">
            <section className="space-y-4">
                <p className="font-mono text-cyan-400 text-xs uppercase tracking-widest">Effective Date: 20th February 2026</p>
                <p className="text-sm font-bold text-gray-400">Product by Addinfi</p>
                <div className="h-px bg-white/5 w-full"></div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    1. Information We Collect
                </h2>
                <p>We may collect information to provide better services to our users. This includes:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        "Name", "Email Address", "Contact Details",
                        "Company Information", "Usage Data", "IP Address",
                        "Device Information", "Cookies"
                    ].map((item, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm text-gray-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                            {item}
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    2. How We Use Information
                </h2>
                <p>We use collected data to:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Provide and improve services</li>
                    <li>Communicate with users</li>
                    <li>Process transactions</li>
                    <li>Analyze platform performance</li>
                    <li>Ensure security and fraud prevention</li>
                </ul>
                <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl mt-4">
                    <p className="text-sm font-bold text-blue-400 uppercase tracking-widest">Our Promise</p>
                    <p className="text-sm mt-1">We do not sell personal data to third parties.</p>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    3. Data Sharing
                </h2>
                <p>We may share data with trusted partners to facilitate our services:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Payment processors</li>
                    <li>Hosting providers</li>
                    <li>Analytics providers</li>
                    <li>Legal authorities (when required)</li>
                </ul>
                <p className="text-sm italic text-gray-400">All partners are required to maintain confidentiality and adhere to data protection standards.</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    4. Data Security
                </h2>
                <p>We implement reasonable security safeguards to protect your information. However, please be aware that no online transmission is 100% secure. We cannot guarantee absolute data security.</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    5. Cookies
                </h2>
                <p>We use cookies to improve user experience, analyze traffic, and track performance. You may disable cookies via your browser settings, though this may impact certain site features.</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    6. Data Retention
                </h2>
                <p>We retain user data as long as necessary for business, compliance, or legal purposes.</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    7. User Rights
                </h2>
                <p>Users may request:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Access to their data</li>
                    <li>Correction of inaccuracies</li>
                    <li>Deletion (subject to legal obligations)</li>
                </ul>
                <p>Requests can be sent to the contact email listed below.</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    8. Third-Party Links
                </h2>
                <p>Our website may contain links to third-party websites. We are not responsible for their privacy practices or content.</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    9. Updates to Privacy Policy
                </h2>
                <p>We reserve the right to update this policy at any time. Continued use of the platform implies acceptance of the updated terms.</p>
            </section>

            <section className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/20">
                <h2 className="text-xl font-bold text-white mb-4">Contact Privacy Team</h2>
                <p className="text-sm text-gray-400">For any privacy-related inquiries, please email us at <a href="mailto:info@addinfi.com" className="text-cyan-400 hover:underline">info@addinfi.com</a>.</p>
            </section>
        </PolicyLayout>
    );
};

export default PrivacyPolicy;

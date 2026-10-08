// Shared SEO constants: canonical URL, copy reused in metadata, and FAQ content that is both
// rendered on the page and emitted as FAQPage structured data (the two must match).

export const SITE_URL = "https://www.whatmyrank.com";
export const SITE_NAME = "WhatMyRank";

// Keep in sync with RAZORPAY_PRICE_AMOUNT — it is shown on the page and in Product schema.
export const AUDIT_PRICE = 99;

export const SEO_TITLE = "GMB Audit Tool: Google Business Profile Audit | WhatMyRank";
export const SEO_DESCRIPTION =
    `Run a GMB audit in minutes. Score your Google Business Profile, compare it with local competitors, find ranking gaps and get a 4-week fix plan for ₹${AUDIT_PRICE}.`;

export const FAQS: { q: string; a: string }[] = [
    {
        q: "What is a GMB audit tool?",
        a: "A GMB audit tool reviews your Google Business Profile (formerly Google My Business) and scores how well it is set up to rank on Google Maps and in the local pack. WhatMyRank checks reviews, rating trend, review responses, posting activity, photos, products and services, profile strength and suspension risk, then compares every signal with your top local competitors.",
    },
    {
        q: "How do I audit my Google Business Profile?",
        a: "Search for your business on WhatMyRank, pick your listing, and add up to two competitors that rank above you on Google Maps. The tool analyses all three profiles and generates a scored Google Business Profile audit report with your gaps, your wins and a 4-week action plan. You don't need to log in to Google or share access to your profile.",
    },
    {
        q: "How does the GMB audit compare my business with competitors?",
        a: "Your profile is benchmarked side by side with up to two competitors on 14 ranking signals, including review volume, review velocity, response rate, rating trend, sentiment, post frequency, photos and products/services. The report shows which competitor wins each signal and the percentage gap between you and the market leader.",
    },
    {
        q: "What does the GBP audit report include?",
        a: "Every report includes an overall audit score out of 100, a competitor comparison matrix, 9 profile gaps and 9 wins, a gap analysis grouped into Reputation, Engagement, Relevance and Accessibility, a suspension risk check and a week-by-week 4-week action plan. You can download it as a PDF and a copy is sent to your email.",
    },
    {
        q: "How much does the Google Business Profile audit cost?",
        a: `A full GMB audit report costs ₹${AUDIT_PRICE} as a one-time payment — there is no subscription. You can pay with UPI, cards or netbanking through Razorpay, and coupon codes can be applied at checkout.`,
    },
    {
        q: "How long does it take to generate a GMB audit report?",
        a: "Most reports are ready within a few minutes. Once you select your business and competitors, the analysis runs automatically and the finished report appears on screen, in My Reports and in your inbox.",
    },
    {
        q: "Will a GMB audit improve my Google Maps ranking?",
        a: "The audit itself does not change your ranking, but it shows exactly which signals are holding your profile back. Fixing the gaps it highlights — such as review volume, response rate, categories, posts and photos — improves relevance and prominence, which are two of the three factors Google uses to rank local results.",
    },
    {
        q: "How often should I audit my Google Business Profile?",
        a: "Audit your profile once a month while you are actively optimising it, and at least once a quarter after that. Re-running the audit after you complete the 4-week plan is the easiest way to measure progress against your competitors.",
    },
    {
        q: "Is a GMB audit the same as a local SEO audit?",
        a: "No. A GMB audit focuses on your Google Business Profile — the listing that appears on Google Maps and in the local pack. A full local SEO audit also covers your website, citations and backlinks. Because your Google Business Profile is the biggest driver of Map Pack visibility, a GMB audit is the best place to start.",
    },
    {
        q: "Is this GMB audit tool suitable for agencies and multi-location businesses?",
        a: "Yes. Agencies use WhatMyRank audits as a pitch opener or onboarding baseline, and multi-location brands can audit each location against its own local competitors. For bulk audits, contact info@addinfi.com.",
    },
    {
        q: "Do I need SEO knowledge to understand the report?",
        a: "No. The report is written in plain language for business owners. Every gap comes with a clear explanation and every week of the action plan lists specific tasks with time estimates.",
    },
    {
        q: "Who built WhatMyRank?",
        a: "WhatMyRank is built by Addinfi Digitech Pvt. Ltd., a Google Partner digital marketing agency with offices in Nagpur and Pune. Addinfi runs SEO, Google Ads and social media marketing for 100+ clients, and built WhatMyRank to give every local business an affordable way to audit its Google Business Profile.",
    },
];

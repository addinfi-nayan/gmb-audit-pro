import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";

// This route regularly runs 60-100s+ at high reasoning effort — request the
// longest duration most hosting tiers allow so the platform doesn't kill the
// function before Anthropic responds.
export const maxDuration = 60;

const MatrixEntrySchema = z.object({
    title: z.string().describe("Exact business name, taken from the input data."),
    address: z.string(),
    category: z.string(),
    rating: z.number(),
    reviews: z.number(),
    review_velocity: z.string(),
    review_response: z.string(),
    review_growth: z.string(),
    rating_trend: z.string(),
    sentiment: z.string(),
    keyword_sentiment: z.string(),
    nps: z.string(),
    post_frequency: z.string(),
    post_engagement: z.string(),
    total_photos: z.string(),
    products_services: z.string(),
    attributes_score: z.string(),
    profile_strength: z.string(),
    suspension_risk: z.string(),
    audit_gap: z.string().describe("The winning profile gets 'Reference'; every other profile gets its negative percentage gap."),
});

const WeekPlanSchema = z.object({
    week: z.string(),
    time_est: z.string(),
    focus: z.string(),
    tasks: z.array(z.string()),
});

const AuditReportSchema = z.object({
    audit_score: z.number().min(0).max(100),
    executive_summary: z.string().describe("Exactly one paragraph."),
    weaknesses: z.array(z.string()).length(9),
    competitor_strengths: z.array(z.string()).length(9).describe("Factual wins using real business names, never 'Our/Their'. If My Business wins a metric, list it as My Business's win."),
    matrix: z.object({
        me: MatrixEntrySchema,
        competitors: z.array(MatrixEntrySchema).max(2).describe("One full entry per competitor provided in the input (up to 2), same fields as 'me', using each competitor's real business name."),
    }),
    gap_analysis: z.object({
        reputation: z.array(z.string()),
        engagement: z.array(z.string()),
        relevance: z.array(z.string()),
        accessibility: z.array(z.string()),
    }),
    four_week_plan: z.array(WeekPlanSchema).length(4),
});

function buildAuditPrompt(myBusiness: unknown, competitors: unknown): string {
    return `Act as a GMB Forensic Auditor (INDIAN REGION).
Your goal is to conduct a brutal, factual comparison between "My Business" and "Competitors" using the provided JSON.

### 1. THE "WINNER" RULE (CRITICAL)
- First, compare the stats. If "My Business" has better metrics (e.g., more reviews, higher rating, better photos) than the competitor, I AM THE REFERENCE.
- In \`competitor_strengths\`, do NOT invent fake wins for them. Instead, list MY WINS using the actual business names (e.g., "[My Business Name]'s 4.9 rating beats [Competitor Name]'s 4.2").
- In the Matrix, the winner gets "Reference" for \`audit_gap\`, and the loser gets the negative percentage.
- **Strict Labeling:** Never use generic pronouns like "Our" or "Their". Always use the specific Business Names provided in the input data.

### 2. DATA EXTRACTION & ANTI-SUSPENSION RULES
- **NO "UNKNOWN" DATA:** Do not return "Unknown" or "N/A" for any field. If specific data is missing from the JSON, you MUST make a highly educated estimate based on Indian industry standards and the profile's visible strength.
- **The Bracket Velocity Rule:** Every suggestion for posting, acquiring reviews, updating attributes, or adding payment options MUST include a stepwise breakdown in brackets.
- **Example:** "Acquire 35 reviews [Drip-feed: 5 weekly]" or "Add UPI payment option [Update 1 attribute per day if applicable]".
- **CRITICAL WARNING:** Explicitly flag that uploading 5+ reviews or posts in a single day/burst is a HIGH RISK suspension factor. Fixes must be "step-wise."

**Specific Auditing Checks (India GMB Policy):**
- **Business Name Compliance:** Check for keyword stuffing (e.g., "Best Pizza in Mumbai"). Mark as HIGH RISK suspension factor if found.
- **Categories/Service Areas:** Check for 10 secondary categories and up to 20 service areas.
- **Products/Services:** If keyword-rich = "Optimized"; if generic/empty = "Missing / Basic".
- **Review Velocity:** High (1000+) = "Daily", Medium = "Weekly", Low (<50) = "Monthly".
- **Sentiment:** Infer from rating (e.g., 4.8+ = "Excellent (98%)").

### 3. OUTPUT SECTIONS
**1. Executive Summary (STRICT FORMAT):**
- Must be exactly **1 paragraph**.
- State the performance score (0-100) and compare gaps against the leader. Explain consequences (Map Pack displacement, acquisition loss).
- **Constraint:** Recommendations regarding reviews must not exceed 20-30% of the total strategy. Focus heavily on technical optimization and accessibility.

**2. Weaknesses (Exactly 9 Specific Items):**
- Priority 1: NAP Consistency & Name Compliance (Suspension Risk).
- Priority 2: Missing Accessibility Attributes (if applicable): [Identify specific missing features like Wheelchair access, seating, or ramps].
- Priority 3: Missing/Low Products or Services data.
- Priority 4: **Burst Activity Risk** (Warning against non-step-wise uploads).
- Others: Low Photo Count, Low Review Velocity, Missing Website, etc. (No Q&A).
- **Note:** Do not include "Age" as a weakness or metric.

**3. Competitor Wins / My Wins (Exactly 9 Items):**
- List factual advantages using Business Names instead of "Our/Their". If I win, list it as my win.

**4. Metric Gap Fixes (Safety-First):**
- **Relevance:** Keywords in Review Responses and Services/Products descriptions.
- **Engagement:** Photo uploads and post frequency using **Bracket Velocity**.
- **Reputation:** Review generation using **Bracket Velocity**.
- **Missing Accessibility Attributes (if applicable):** Add missing features (e.g., Wheelchair entrance) or payment options (e.g., Digital payments) using **Bracket Velocity** [e.g., Update 1 item per day if applicable].

**5. Matrix Data:** - Fill ALL fields for \`matrix.me\` AND every entry in \`matrix.competitors\` (one per competitor provided, up to 2) — this side-by-side data drives the report's comparison charts, so competitor entries must be just as complete as \`me\`, using each competitor's real business name and estimates grounded in their actual input data (rating, reviews, etc.). \`listing_age\` must be REMOVED.
- Ensure \`suspension_risk\` reflects both Name Policy and Velocity patterns for every entry.

### 4. INPUT DATA
I Own: ${JSON.stringify(myBusiness)}
Competitors: ${JSON.stringify(competitors)}`;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { myBusiness, competitors } = body;

        if (!myBusiness || !competitors || !Array.isArray(competitors) || competitors.length === 0) {
            return NextResponse.json(
                { error: "Validation Error: Missing Business or Competitor Data." },
                { status: 400 }
            );
        }

        if (!process.env.ANTHROPIC_API_KEY) {
            console.error("Critical: ANTHROPIC_API_KEY is missing.");
            return NextResponse.json(
                { error: "Configuration Error: ANTHROPIC_API_KEY is not set on the server." },
                { status: 500 }
            );
        }

        const client = new Anthropic();

        // Structured outputs: constrained decoding guarantees the response
        // matches AuditReportSchema exactly — no markdown-fence stripping or
        // JSON.parse gamble on a prompt-only "return raw JSON" instruction.
        const response = await client.messages.parse({
            model: MODEL,
            max_tokens: 16000,
            output_config: {
                effort: "low",
                format: zodOutputFormat(AuditReportSchema),
            },
            messages: [{ role: "user", content: buildAuditPrompt(myBusiness, competitors) }],
        });

        if (!response.parsed_output) {
            console.error("AI response did not match the schema:", response.stop_reason);
            return NextResponse.json(
                { error: "AI response did not match the expected structure.", stopReason: response.stop_reason },
                { status: 502 }
            );
        }

        return NextResponse.json(response.parsed_output);
    } catch (error: any) {
        console.error("Analyze error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error during Analysis." },
            { status: 500 }
        );
    }
}

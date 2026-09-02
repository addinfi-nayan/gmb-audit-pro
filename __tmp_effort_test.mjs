import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MatrixEntrySchema = z.object({
  address: z.string(), category: z.string(), rating: z.number(), reviews: z.number(),
  review_velocity: z.string(), review_response: z.string(), review_growth: z.string(),
  rating_trend: z.string(), sentiment: z.string(), keyword_sentiment: z.string(), nps: z.string(),
  post_frequency: z.string(), post_engagement: z.string(), total_photos: z.string(),
  products_services: z.string(), attributes_score: z.string(), profile_strength: z.string(),
  suspension_risk: z.string(), audit_gap: z.string(),
});
const WeekPlanSchema = z.object({ week: z.string(), time_est: z.string(), focus: z.string(), tasks: z.array(z.string()) });
const AuditReportSchema = z.object({
  audit_score: z.number().min(0).max(100),
  executive_summary: z.string(),
  weaknesses: z.array(z.string()).length(9),
  competitor_strengths: z.array(z.string()).length(9),
  matrix: z.object({ me: MatrixEntrySchema, competitors: z.array(z.string()).max(0) }),
  gap_analysis: z.object({ reputation: z.array(z.string()), engagement: z.array(z.string()), relevance: z.array(z.string()), accessibility: z.array(z.string()) }),
  four_week_plan: z.array(WeekPlanSchema).length(4),
});

const prompt = `Act as a GMB Forensic Auditor (INDIAN REGION). Return structured audit data.
I Own: {"title":"Test Biz","rating":4.5,"reviews":20}
Competitors: [{"title":"Competitor A","rating":4.2,"reviews":15}]`;

for (const effort of ["medium", "high"]) {
  const start = Date.now();
  const response = await client.messages.parse({
    model: process.env.ANTHROPIC_MODEL || "claude-opus-5",
    max_tokens: 8000,
    output_config: { effort, format: zodOutputFormat(AuditReportSchema) },
    messages: [{ role: "user", content: prompt }],
  });
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`effort=${effort}: ${elapsed}s, output_tokens=${response.usage.output_tokens}, has_output=${!!response.parsed_output}`);
}

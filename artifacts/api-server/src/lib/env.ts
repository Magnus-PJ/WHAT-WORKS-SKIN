import { z } from "zod";

const envSchema = z.object({
  PORT: z
    .string()
    .transform((val) => {
      const port = Number(val);
      if (isNaN(port) || port <= 0) {
        throw new Error("PORT must be a positive number");
      }
      return port;
    })
    .default("3000"),
  SESSION_SECRET: z.string({
    required_error: "SESSION_SECRET environment variable is required to sign cookies",
  }).min(1, "SESSION_SECRET cannot be empty"),
  DATABASE_URL: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  TRUST_PROXY: z.string().optional().default("1"),
  TREND_SYNC_GITHUB_TOKEN: z.string().optional(),
  TREND_SYNC_GITHUB_OWNER: z.string().optional(),
  TREND_SYNC_GITHUB_REPO: z.string().optional(),
  TREND_SYNC_GITHUB_BASE_BRANCH: z.string().optional().default("main"),
  TREND_SYNC_GITHUB_REVIEWERS: z.string().optional(),
  SLACK_WEBHOOK_URL: z.string().optional(),
  DISCORD_WEBHOOK_URL: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error("Environment validation failed");
  }

  return result.data;
}

export const env = validateEnv();

/**
 * Environment Configuration
 * Centralized environment variable access
 */

export const env = {
  // Google Generative AI
  googleAI: {
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  },

  // App Configuration
  app: {
    env: process.env.NODE_ENV || "development",
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
  },
} as const;

/**
 * Validate required environment variables
 */
export function validateEnv(): void {
  const errors: string[] = [];

  if (!env.googleAI.apiKey && env.app.isProduction) {
    errors.push("GOOGLE_GENERATIVE_AI_API_KEY is required in production");
  }

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${errors.map((e) => `  - ${e}`).join("\n")}`,
    );
  }
}

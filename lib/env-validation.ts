/**
 * Environment variable validation
 * Validates required environment variables on application startup
 */

interface EnvConfig {
  name: string;
  required: boolean;
  description: string;
}

const ENV_CONFIG: EnvConfig[] = [
  // Supabase configuration
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    required: true,
    description: "Supabase project URL",
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    required: true,
    description: "Supabase anonymous key",
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    required: true,
    description: "Supabase service role key (server-side only)",
  },

  // Admin configuration
  {
    name: "ADMIN_SIGNUP_SECRET",
    required: true,
    description: "Secret key for admin user registration",
  },

  // Payment configuration
  {
    name: "STRIPE_SECRET_KEY",
    required: false,
    description: "Stripe secret key for payment processing",
  },
  {
    name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    required: false,
    description: "Stripe publishable key (client-side)",
  },

  // AI configuration
  {
    name: "ANTHROPIC_API_KEY",
    required: false,
    description: "Anthropic API key for AI letter generation",
  },
];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates all required environment variables
 * @param throwOnError - If true, throws an error when validation fails
 * @returns Validation result with errors and warnings
 */
export function validateEnv(throwOnError = true): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const config of ENV_CONFIG) {
    const value = process.env[config.name];

    if (!value || value.trim() === "") {
      if (config.required) {
        errors.push(
          `Missing required environment variable: ${config.name} (${config.description})`
        );
      } else {
        warnings.push(
          `Optional environment variable not set: ${config.name} (${config.description})`
        );
      }
    }
  }

  const valid = errors.length === 0;

  if (!valid && throwOnError) {
    const errorMessage = [
      "Environment validation failed:",
      ...errors.map((err) => `  - ${err}`),
    ].join("\n");
    throw new Error(errorMessage);
  }

  return { valid, errors, warnings };
}

/**
 * Gets a required environment variable or throws an error
 * Use this instead of non-null assertion operator (!)
 */
export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${name}. Please check your .env file.`
    );
  }
  return value;
}

/**
 * Gets an optional environment variable with a default value
 */
export function getOptionalEnv(name: string, defaultValue = ""): string {
  return process.env[name] || defaultValue;
}

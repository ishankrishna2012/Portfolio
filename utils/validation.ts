import { z } from 'zod';

// Input Validation Schemas

export const emailSchema = z.string().email("Invalid email address format").min(5).max(100);

// Password complexity: min 8 chars, at least one number and one special char
export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(64, "Password too long")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

export const urlSchema = z.string().url("Must be a valid URL").startsWith("http", "URL must start with http/https");

export const textContentSchema = z.string()
  .min(1, "Content cannot be empty")
  .max(1000, "Content exceeds maximum length (1000 characters)")
  .refine(val => !/<script\b[^>]*>([\s\S]*?)<\/script>/gm.test(val), "Illegal characters detected (XSS protection)");

export const githubUsernameSchema = z.string()
  .min(1, "Username cannot be empty")
  .max(39, "Username too long")
  .regex(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i, "Invalid GitHub username format. Use alphanumeric characters or single hyphens.");

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/<[^>]*>?/gm, ''); // Basic HTML tag stripping
};

export const validateUpdate = (key: string, value: string): { valid: boolean; error?: string } => {
  try {
    // Bypass validation for large Base64 image strings
    if (key === 'heroImage') {
      if (!value.startsWith('data:image') && !value.startsWith('http')) {
         return { valid: false, error: "Invalid image format" };
      }
      return { valid: true };
    }

    if (['linkedinUrl', 'twitterUrl', 'githubLink'].includes(key)) {
      urlSchema.parse(value);
    } else if (key === 'email') {
      emailSchema.parse(value);
    } else if (key === 'githubUsername') {
      githubUsernameSchema.parse(value);
    } else {
      // Default for 'heroTagline', 'aboutText', 'title', 'description'
      textContentSchema.parse(value);
    }
    return { valid: true };
  } catch (e: any) {
    return { valid: false, error: e.errors?.[0]?.message || "Validation failed" };
  }
};
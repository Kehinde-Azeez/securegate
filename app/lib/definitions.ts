import { z } from "zod";

export const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Please enter a valid email address").trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character")
    .trim(),
});

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address").trim(),
  password: z.string().min(1, "Password is required").trim(),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address").trim(),
});

export const ResetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character")
    .trim(),
});

export type ActionState =
  | {
      success: boolean;
      message: string;
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
    }
  | undefined;

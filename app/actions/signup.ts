"use server";

import { prisma } from "../lib/prisma";
import { SignupSchema, ActionState } from "../lib/definitions";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

export async function signUpAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // 1. Validate fields
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validatedFields = SignupSchema.safeParse({ name, email, password });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "Email is already registered.",
        errors: {
          email: ["This email is already in use."],
        },
      };
    }

    // 3. Hash password using 12 salt rounds (as strictly required)
    const hashedPassword = await bcryptjs.hash(password, 12);

    // 4. Generate secure 32-byte verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // 5. Save user and token in a database transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          emailVerified: false,
        },
      });

      await tx.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      });
    });

    // 6. Send verification email via Resend
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationLink = `${baseUrl}/verify-email/${token}`;

    console.log("-----------------------------------------");
    console.log("DEVELOPER ALERT: Email Verification Link");
    console.log(`To: ${email}`);
    console.log(`URL: ${verificationLink}`);
    console.log("-----------------------------------------");

    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: "SecureGate <onboarding@resend.dev>",
          to: email,
          subject: "Verify your SecureGate Account",
          html: `
            <div style="font-family: sans-serif; padding: 24px; max-width: 600px; margin: auto; border: 1px solid #e4e4e7; rounded: 8px;">
              <h2 style="color: #18181b; font-size: 24px; font-weight: 700; margin-bottom: 16px;">Verify your SecureGate Account</h2>
              <p style="color: #52525b; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
                Thank you for signing up for SecureGate. To complete your registration, please verify your email address by clicking the button below:
              </p>
              <a href="${verificationLink}" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 12px 24px; font-size: 16px; font-weight: 500; text-decoration: none; border-radius: 6px; margin-bottom: 24px;">
                Verify Email Address
              </a>
              <p style="color: #71717a; font-size: 14px; line-height: 20px;">
                This link will expire in 15 minutes. If you did not request this registration, you can safely ignore this email.
              </p>
              <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
              <p style="color: #a1a1aa; font-size: 12px;">
                Or copy and paste this URL into your browser: <br />
                <a href="${verificationLink}" style="color: #2563eb; word-break: break-all;">${verificationLink}</a>
              </p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Resend error (falling back to console log only):", emailErr);
      }
    }

    return {
      success: true,
      message: "Account created successfully! Please check your email to verify your account.",
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      message: "An internal security error occurred. Please try again later.",
    };
  }
}

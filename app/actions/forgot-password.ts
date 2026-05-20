"use server";

import { prisma } from "../lib/prisma";
import { ForgotPasswordSchema } from "../lib/definitions";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

export async function forgotPasswordAction(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; message: string; errors?: { email?: string[] } }> {
  const email = formData.get("email") as string;

  const validatedFields = ForgotPasswordSchema.safeParse({ email });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const successMessage =
    "If an account with that email exists, a password reset link has been sent.";

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // IMPORTANT: If email not found, still return a success message — do not confirm whether email exists
    if (!user) {
      return {
        success: true,
        message: successMessage,
      };
    }

    // Generate secure reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    await prisma.$transaction(async (tx) => {
      // Clean up old reset tokens for this email
      await tx.passwordResetToken.deleteMany({
        where: { email },
      });

      // Create new token
      await tx.passwordResetToken.create({
        data: {
          email,
          token,
          expires,
        },
      });
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password/${token}`;

    console.log("-----------------------------------------");
    console.log("DEVELOPER ALERT: Password Reset Link");
    console.log(`To: ${email}`);
    console.log(`URL: ${resetLink}`);
    console.log("-----------------------------------------");

    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: "SecureGate <onboarding@resend.dev>",
          to: email,
          subject: "Reset your SecureGate Password",
          html: `
            <div style="font-family: sans-serif; padding: 24px; max-width: 600px; margin: auto; border: 1px solid #e4e4e7; rounded: 8px;">
              <h2 style="color: #18181b; font-size: 24px; font-weight: 700; margin-bottom: 16px;">Reset your SecureGate Password</h2>
              <p style="color: #52525b; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
                You requested a password reset for your SecureGate account. Please click the button below to set a new password:
              </p>
              <a href="${resetLink}" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 12px 24px; font-size: 16px; font-weight: 500; text-decoration: none; border-radius: 6px; margin-bottom: 24px;">
                Reset Password
              </a>
              <p style="color: #71717a; font-size: 14px; line-height: 20px;">
                This link will expire in 1 hour. If you did not make this request, you can safely ignore this email. Your password will remain unchanged.
              </p>
              <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
              <p style="color: #a1a1aa; font-size: 12px;">
                Or copy and paste this URL into your browser: <br />
                <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
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
      message: successMessage,
    };
  } catch (err) {
    console.error("Forgot password error:", err);
    return {
      success: false,
      message: "An internal security error occurred. Please try again.",
    };
  }
}

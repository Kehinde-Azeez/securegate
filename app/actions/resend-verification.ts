"use server";

import { prisma } from "../lib/prisma";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

export async function resendVerificationAction(
  email: string
): Promise<{ success: boolean; message: string }> {
  if (!email || !email.includes("@")) {
    return { success: false, message: "Please enter a valid email address." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // If the user doesn't exist, return success silently to prevent user enumeration
    if (!user) {
      return {
        success: true,
        message: "If an account with that email exists, a new verification link has been sent.",
      };
    }

    if (user.emailVerified) {
      return {
        success: false,
        message: "This email address is already verified. Please sign in.",
      };
    }

    // Generate secure 32-byte verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.$transaction(async (tx) => {
      // Delete old verification tokens for this user
      await tx.verificationToken.deleteMany({
        where: { identifier: email },
      });

      // Create new token
      await tx.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      });
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationLink = `${baseUrl}/verify-email/${token}`;

    console.log("-----------------------------------------");
    console.log("DEVELOPER ALERT: Resent Email Verification Link");
    console.log(`To: ${email}`);
    console.log(`URL: ${verificationLink}`);
    console.log("-----------------------------------------");

    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: "SecureGate <onboarding@resend.dev>",
          to: email,
          subject: "Verify your SecureGate Account (New Link)",
          html: `
            <div style="font-family: sans-serif; padding: 24px; max-width: 600px; margin: auto; border: 1px solid #e4e4e7; rounded: 8px;">
              <h2 style="color: #18181b; font-size: 24px; font-weight: 700; margin-bottom: 16px;">Verify your SecureGate Account</h2>
              <p style="color: #52525b; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
                You requested a new verification link for your SecureGate account. Please click the button below to verify your email address:
              </p>
              <a href="${verificationLink}" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 12px 24px; font-size: 16px; font-weight: 500; text-decoration: none; border-radius: 6px; margin-bottom: 24px;">
                Verify Email Address
              </a>
              <p style="color: #71717a; font-size: 14px; line-height: 20px;">
                This link will expire in 15 minutes. If you did not request a new link, you can safely ignore this email.
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
      message: "If an account with that email exists, a new verification link has been sent.",
    };
  } catch (err) {
    console.error("Resend verification error:", err);
    return {
      success: false,
      message: "An internal security error occurred. Please try again later.",
    };
  }
}

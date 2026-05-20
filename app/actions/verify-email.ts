"use server";

import { prisma } from "../lib/prisma";

export async function verifyEmailAction(
  token: string
): Promise<{ success: boolean; message: string; email?: string }> {
  if (!token) {
    return { success: false, message: "Invalid verification link." };
  }

  try {
    // 1. Look up token in database
    const dbToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!dbToken) {
      return {
        success: false,
        message: "The verification link is invalid or has already been used.",
      };
    }

    // 2. Check if token has expired
    const hasExpired = new Date(dbToken.expires) < new Date();
    if (hasExpired) {
      return {
        success: false,
        message: "The verification link has expired. Please request a new one below.",
        email: dbToken.identifier, // Return email so the user can easily request a new link
      };
    }

    // 3. Mark user as verified and delete token in transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { email: dbToken.identifier },
        data: { emailVerified: true },
      });

      await tx.verificationToken.delete({
        where: { token },
      });
    });

    return {
      success: true,
      message: "Your email address has been successfully verified! You can now log in.",
    };
  } catch (error) {
    console.error("Verification error:", error);
    return {
      success: false,
      message: "An internal security error occurred during verification. Please try again.",
    };
  }
}

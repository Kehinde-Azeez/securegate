"use server";

import { prisma } from "../lib/prisma";
import { ResetPasswordSchema } from "../lib/definitions";
import bcryptjs from "bcryptjs";

export async function resetPasswordAction(
  token: string,
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; message: string; errors?: { password?: string[] } }> {
  if (!token) {
    return { success: false, message: "Invalid or missing token." };
  }

  const password = formData.get("password") as string;

  // 1. Validate password strength on server
  const validatedFields = ResetPasswordSchema.safeParse({ password });
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // 2. Look up token in database
    const dbToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!dbToken) {
      return {
        success: false,
        message: "The password reset link is invalid or has already been used.",
      };
    }

    // 3. Verify expiry
    const hasExpired = new Date(dbToken.expires) < new Date();
    if (hasExpired) {
      return {
        success: false,
        message: "The password reset link has expired. Please request a new one.",
      };
    }

    // 4. Hash new password with 12 salt rounds
    const hashedPassword = await bcryptjs.hash(password, 12);

    // 5. Update user and delete token in database transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { email: dbToken.email },
        data: { password: hashedPassword },
      });

      await tx.passwordResetToken.delete({
        where: { token },
      });
    });

    return {
      success: true,
      message: "Your password has been reset successfully! You can now log in.",
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      message: "An internal security error occurred during password reset. Please try again.",
    };
  }
}

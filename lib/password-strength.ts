export type PasswordStrength = {
  label: string;
  class: string; // CSS class for bar styling
  score: number; // 0: none, 1: weak, 2: fair, 3: strong
};

/**
 * Evaluate the strength of a password.
 * Returns a {label, class, score} object used by UI.
 */
export function evaluatePassword(pw: string): PasswordStrength {
  if (!pw) {
    return { label: "None", class: "", score: 0 };
  }

  let score = 0;
  if (pw.length >= 8) score += 1;

  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /[0-9]/.test(pw);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pw);

  const categories = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;
  if (categories >= 2) score += 1;
  if (categories === 4 && pw.length >= 10) score += 1; // extra strong

  if (score <= 1) {
    return { label: "Weak", class: "weak", score: 1 };
  } else if (score === 2) {
    return { label: "Fair", class: "fair", score: 2 };
  } else {
    return { label: "Strong", class: "strong", score: 3 };
  }
}

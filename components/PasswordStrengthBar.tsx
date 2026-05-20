import React from "react";
import { PasswordStrength } from "../lib/password-strength";

interface PasswordStrengthBarProps {
  strength: PasswordStrength;
}

export const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({ strength }) => {
  if (!strength) return null;
  return (
    <div className="space-y-1.5 mb-2">
      <div className="flex justify-between items-center text-xs">
        <span className="text-zinc-400">Strength:</span>
        <span
          className={`font-medium ${
            strength.score === 1
              ? "text-red-400"
              : strength.score === 2
              ? "text-amber-400"
              : "text-emerald-400"
          }`}
        >
          {strength.label}
        </span>
      </div>
      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`strength-bar ${strength.class}`} />
      </div>
      <p className="text-[10px] text-zinc-500 leading-normal">
        Must contain at least 8 characters, with uppercase, lowercase, numbers, and special characters.
      </p>
    </div>
  );
};

export default PasswordStrengthBar;

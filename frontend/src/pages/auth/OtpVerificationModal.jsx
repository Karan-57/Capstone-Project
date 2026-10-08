import React, { useState, useRef, useEffect } from "react";
import { ShieldCheck, ArrowRight, RotateCw, CheckCircle2, Sparkles } from "lucide-react";
import { verifyEmail, resendOTP } from "../../services/auth.api";

/**
 * Aesthetic OTP verification modal/screen
 * Features:
 * - 6 separate digits with automatic focus progression
 * - Smooth wave / pulse animations
 * - Glowing green check signal animation for each entered valid digit
 * - Resend OTP timer and instant resend
 */
export default function OtpVerificationModal({
  isOpen = true,
  email = "",
  role = "creator",
  onSuccess,
  onCancel,
}) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(45);
  const inputRefs = useRef([]);

  const isCreator = role === "creator";
  const accentGradient = isCreator
    ? "from-purple-600 to-indigo-600 shadow-purple-500/25"
    : "from-blue-600 to-sky-600 shadow-blue-500/25";

  // Focus first input on mount
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    // Only accept numeric inputs
    const cleanVal = value.replace(/[^0-9]/g, "");
    if (!cleanVal) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    // Handle multi-character paste
    if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 6).split("");
      const next = [...digits];
      pasted.forEach((ch, i) => {
        if (i < 6) next[i] = ch;
      });
      setDigits(next);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
      setActiveIdx(nextFocus);
      if (pasted.length === 6) {
        handleAutoSubmit(next.join(""));
      }
      return;
    }

    const next = [...digits];
    next[index] = cleanVal[cleanVal.length - 1];
    setDigits(next);
    setErrorMsg("");

    // Auto-advance
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveIdx(index + 1);
    }

    // If complete
    const fullCode = next.join("");
    if (fullCode.length === 6) {
      handleAutoSubmit(fullCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIdx(index - 1);
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIdx(index - 1);
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveIdx(index + 1);
    }
  };

  const handleAutoSubmit = async (code) => {
    setIsVerifying(true);
    setErrorMsg("");
    try {
      await verifyEmail({ otp: code, email });
      setSuccessMsg("Email successfully verified! Welcome aboard.");
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 900);
    } catch (err) {
      setErrorMsg(err.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) {
      setErrorMsg("Please enter all 6 digits of the verification code.");
      return;
    }
    handleAutoSubmit(code);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMsg("");
    try {
      await resendOTP({ email });
      setSuccessMsg("A new verification code has been sent to your email.");
      setResendCooldown(60);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setActiveIdx(0);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      {/* Glow aura */}
      <div className="absolute w-96 h-96 rounded-full bg-gradient-to-tr from-purple-600/20 to-blue-500/20 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#0F1424] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 text-center overflow-hidden">
        {/* Subtle accent bar at top */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentGradient}`} />

        {/* Icon & Heading */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-purple-400 shadow-inner">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-1.5">
          Verify Your Email
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
        </h3>

        <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
          We sent a 6-digit confirmation code to{" "}
          <span className="text-slate-200 font-semibold">{email || "your email address"}</span>
        </p>

        {/* Messages */}
        {errorMsg && (
          <div className="mt-4 p-2.5 rounded-xl text-xs bg-rose-500/10 border border-rose-500/25 text-rose-400 font-medium animate-shake">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mt-4 p-2.5 rounded-xl text-xs bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-medium flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {successMsg}
          </div>
        )}

        {/* Form with 6 aesthetic inputs */}
        <form onSubmit={handleManualSubmit} className="mt-6">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {digits.map((digit, idx) => {
              const isFilled = digit.length > 0;
              const isActive = activeIdx === idx;
              return (
                <div key={idx} className="relative">
                  <input
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onFocus={() => setActiveIdx(idx)}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl outline-none transition-all duration-200 font-mono ${
                      isFilled
                        ? "bg-emerald-950/40 text-emerald-300 border-2 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.35)] scale-102"
                        : isActive
                        ? isCreator
                          ? "bg-purple-950/30 text-white border-2 border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                          : "bg-blue-950/30 text-white border-2 border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                        : "bg-white/[0.04] text-white border border-white/10 hover:border-white/20"
                    }`}
                  />
                  {/* Green signal check pip when number is entered */}
                  {isFilled && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow-sm animate-scaleIn">
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isVerifying || digits.join("").length !== 6}
            className={`mt-6 w-full py-3 px-4 rounded-xl text-white text-sm font-semibold tracking-wide transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${accentGradient}`}
          >
            {isVerifying ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Verifying Security Code...</span>
              </>
            ) : (
              <>
                <span>Confirm & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Resend and cancel actions */}
        <div className="mt-5 flex items-center justify-between text-xs text-slate-400">
          <button
            type="button"
            onClick={onCancel}
            className="hover:text-slate-200 transition-colors cursor-pointer"
          >
            Back to Sign In
          </button>

          <button
            type="button"
            disabled={resendCooldown > 0 || isResending}
            onClick={handleResend}
            className={`flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
              resendCooldown > 0
                ? "text-slate-500 cursor-not-allowed"
                : isCreator
                ? "text-purple-400 hover:text-purple-300"
                : "text-blue-400 hover:text-blue-300"
            }`}
          >
            {isResending ? (
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
            ) : resendCooldown > 0 ? (
              `Resend Code (${resendCooldown}s)`
            ) : (
              "Resend Code"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

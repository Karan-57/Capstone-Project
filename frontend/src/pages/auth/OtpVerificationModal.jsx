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
  initialCooldown = null,
  onSuccess,
  onCancel,
}) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const inputRefs = useRef([]);

  const cooldownKey = email ? `otp_cooldown_${email.toLowerCase().trim()}` : null;

  const calculateRemaining = () => {
    if (typeof initialCooldown === "number" && initialCooldown >= 0) {
      if (cooldownKey) {
        localStorage.setItem(cooldownKey, (Date.now() + initialCooldown * 1000).toString());
      }
      return initialCooldown;
    }
    if (cooldownKey) {
      const savedExpiry = localStorage.getItem(cooldownKey);
      if (savedExpiry) {
        const remaining = Math.max(0, Math.ceil((Number(savedExpiry) - Date.now()) / 1000));
        if (remaining <= 0) {
          localStorage.removeItem(cooldownKey);
          return 0;
        }
        return remaining;
      }
      // First time initialization: 90s cooldown
      const defaultExpiry = Date.now() + 90 * 1000;
      localStorage.setItem(cooldownKey, defaultExpiry.toString());
      return 90;
    }
    return 90;
  };

  const [resendCooldown, setResendCooldown] = useState(calculateRemaining);

  const formatCooldown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const isCreator = role === "creator";
  const accentGradient = isCreator
    ? "from-purple-600 to-indigo-600 shadow-purple-500/25"
    : "from-blue-600 to-sky-600 shadow-blue-500/25";

  // Re-sync cooldown when modal opens or email / initialCooldown updates
  useEffect(() => {
    if (isOpen && email) {
      setResendCooldown(calculateRemaining());
    }
  }, [isOpen, email, initialCooldown]);

  // Focus first input on mount
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Resend cooldown timer tick: derives from persistent timestamp so navigation or unmount won't reset time
  useEffect(() => {
    if (!isOpen || !email) return;

    const tick = () => {
      if (cooldownKey) {
        const savedExpiry = localStorage.getItem(cooldownKey);
        if (savedExpiry) {
          const remaining = Math.max(0, Math.ceil((Number(savedExpiry) - Date.now()) / 1000));
          setResendCooldown(remaining);
          if (remaining <= 0) {
            localStorage.removeItem(cooldownKey);
          }
          return;
        }
      }
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isOpen, email, cooldownKey]);

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
      if (cooldownKey) {
        localStorage.removeItem(cooldownKey);
      }
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
      const newExpiry = Date.now() + 90 * 1000;
      if (cooldownKey) {
        localStorage.setItem(cooldownKey, newExpiry.toString());
      }
      setResendCooldown(90); // 1:30 min cooldown
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn text-[#261615] dark:text-[#FDEBDE]">
      <div className="relative w-full max-w-md bg-[#FFFDF9] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[8px_8px_0_#382322] dark:shadow-[8px_8px_0_#000] p-6 sm:p-8 text-center overflow-hidden">
        {/* Subtle accent bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FFEBAA] border-b border-[#382322]" />

        {/* Icon & Heading */}
        <div className="mx-auto w-14 h-14 bg-[#FFEBAA] border-2 border-[#382322] shadow-[3px_3px_0_#382322] flex items-center justify-center mb-4 text-[#261615]">
          <ShieldCheck className="w-7 h-7 text-[#261615]" />
        </div>

        <h3 className="text-xl sm:text-2xl font-serif font-black text-[#261615] dark:text-[#FDEBDE] tracking-tight flex items-center justify-center gap-1.5">
          Verify Your Email
          <Sparkles className="w-4 h-4 text-[#8A5200] dark:text-[#FFEBAA]" />
        </h3>

        <p className="text-xs sm:text-sm text-[#5C3A38] dark:text-[#D4B8A8] mt-1.5 max-w-xs mx-auto leading-relaxed font-sans">
          We sent a 6-digit confirmation code to{" "}
          <span className="text-[#261615] dark:text-[#FDEBDE] font-bold underline decoration-[#FFEBAA]">{email || "your email address"}</span>
        </p>

        {/* Messages */}
        {errorMsg && (
          <div className="mt-4 p-2.5 bg-[#FFE4E6] dark:bg-[#881337] border-2 border-[#382322] text-[#9F1239] dark:text-[#FECDD3] text-xs font-bold animate-shake font-sans">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mt-4 p-2.5 bg-[#D1FAE5] dark:bg-[#064E3B] border-2 border-[#382322] text-[#065F46] dark:text-[#A7F3D0] text-xs font-bold flex items-center justify-center gap-1.5 font-sans">
            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            {successMsg}
          </div>
        )}

        {/* Form with 6 inputs */}
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
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono outline-none transition-all duration-200 border-2 ${
                      isFilled
                        ? "bg-[#D1FAE5] dark:bg-[#064E3B] text-[#065F46] dark:text-[#A7F3D0] border-[#065F46] shadow-[2px_2px_0_#065F46]"
                        : isActive
                        ? "bg-[#FFEBAA] text-[#261615] border-[#382322] shadow-[3px_3px_0_#382322]"
                        : "bg-[#FFF7F1] dark:bg-[#19100F] text-[#261615] dark:text-[#FDEBDE] border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322]"
                    }`}
                  />
                  {/* Green signal check pip when number is entered */}
                  {isFilled && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#059669] text-white flex items-center justify-center text-[10px] border border-[#382322] font-bold">
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
            className="mt-6 w-full py-3 px-4 bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[3px_3px_0_#382322] text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:translate-x-0.5 active:translate-y-0.5"
          >
            {isVerifying ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin text-[#261615]" />
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
        <div className="mt-5 flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={onCancel}
            className="text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE] transition-colors cursor-pointer"
          >
            Back to Sign In
          </button>

          <button
            type="button"
            disabled={resendCooldown > 0 || isResending}
            onClick={handleResend}
            className={`flex items-center gap-1 transition-colors cursor-pointer ${
              resendCooldown > 0
                ? "text-[#5C3A38]/50 dark:text-[#D4B8A8]/50 cursor-not-allowed"
                : "text-[#8A5200] dark:text-[#FFEBAA] hover:underline"
            }`}
          >
            {isResending ? (
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
            ) : resendCooldown > 0 ? (
              `Resend (${formatCooldown(resendCooldown)})`
            ) : (
              "Resend Code"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

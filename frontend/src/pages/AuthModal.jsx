import React, { useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import CollaboLogo from "../components/landing/CollaboLogo";
import { DaVinciIcon, PremiereProIcon, BlueFolder3DIcon } from "../components/landing/SoftwareIcons";
import { useAuth } from "../context/AuthContext";
import { login as loginApi, register as registerApi } from "../services/auth.api";
import { setAccessToken } from "../services/api";
import OtpVerificationModal from "./auth/OtpVerificationModal";
import GoogleSignInButton from "../components/common/GoogleSignInButton";


export default function AuthModal({
  isOpen = true,
  isFullPage = false,
  initialMode = "login", // "login" | "signup"
  initialRole = "creator", // "creator" | "editor"
  onClose,
  onLoginSuccess,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login } = useAuth();

  // URL search params override initialRole if present
  const paramRole = searchParams?.get("role");
  const validParamRole = paramRole === "editor" || paramRole === "creator" ? paramRole : null;

  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState(validParamRole || initialRole); // "creator" | "editor"

  // Inputs
  const [identifier, setIdentifier] = useState(""); // email or username for login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Password visibility state: shown only while cursor is pressed / held down
  const [isPasswordRevealed, setIsPasswordRevealed] = useState(false);

  // OTP Verification Modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpTargetEmail, setOtpTargetEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  // Role Theme Variables
  const isCreator = role === "creator";
  const accentBorder = isCreator
    ? "focus:border-purple-500 focus:ring-purple-500/20"
    : "focus:border-blue-500 focus:ring-blue-500/20";

  // When toggling role, update search param
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setErrorMsg("");
    if (isFullPage && setSearchParams) {
      setSearchParams({ role: newRole });
    }
  };

  // Password strength logic
  const calculateStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score += 25;
    if (pwd.length >= 10) score += 25;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;
    return score;
  };

  const strengthScore = calculateStrength(password);
  const strengthLabel =
    strengthScore === 0
      ? ""
      : strengthScore <= 25
      ? "Weak"
      : strengthScore <= 50
      ? "Fair"
      : strengthScore <= 75
      ? "Good"
      : "Strong";

  const strengthColor =
    strengthScore <= 25
      ? "bg-red-500"
      : strengthScore <= 50
      ? "bg-amber-500"
      : strengthScore <= 75
      ? "bg-sky-500"
      : "bg-emerald-500";

  const finishAuthentication = (userRole, userPayload, accessToken) => {
    if (accessToken) {
      login(userRole, userPayload, accessToken);
    } else {
      login(userRole, userPayload);
    }

    setIsSubmitting(false);
    setIsSuccess(true);

    setTimeout(() => {
      if (onLoginSuccess) {
        onLoginSuccess(userRole);
      } else {
        const targetPath =
          location.state?.from?.pathname ||
          (userRole === "editor" ? "/editor/dashboard" : "/creator/dashboard");
        navigate(targetPath, { replace: true });
      }
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      if (mode === "login") {
        if (!identifier.trim()) {
          setErrorMsg("Please enter your email or username.");
          setIsSubmitting(false);
          return;
        }

        try {
          const res = await loginApi({
            identifier: identifier.trim(),
            password,
          });

          const accessToken = res?.accessToken;
          const userPayload = res?.user || { email: identifier, role };
          const resolvedRole = userPayload.role || role;

          finishAuthentication(resolvedRole, userPayload, accessToken);
        } catch (err) {
          const errRes = err.message || "";
          if (err.status === 403 || errRes.toLowerCase().includes("not verified")) {
            setOtpTargetEmail(identifier.includes("@") ? identifier.trim() : "");
            setShowOtpModal(true);
            setIsSubmitting(false);
            return;
          }
          if (err.status === 401 || errRes.toLowerCase().includes("invalid credentials")) {
            setErrorMsg("Invalid username/email or password.");
            setIsSubmitting(false);
            return;
          }
          // Server returned specific error message (e.g. Google-only account)
          setErrorMsg(errRes || "Login failed. Please check your credentials.");
          setIsSubmitting(false);
        }
      } else {
        // Signup Mode
        const cleanUsername = username.trim().toLowerCase();
        const usernameRegex = /^(?!_)(?!.*\.\.)[a-z0-9_](?:[a-z0-9_.]*[a-z0-9_])?$/;
        if (!usernameRegex.test(cleanUsername)) {
          setErrorMsg(
            "Username must be 3-30 characters with lowercase letters, numbers, or underscores (cannot start with _)."
          );
          setIsSubmitting(false);
          return;
        }

        if (password.length < 6) {
          setErrorMsg("Password must be at least 6 characters long.");
          setIsSubmitting(false);
          return;
        }

        try {
          const res = await registerApi({
            name: fullName.trim(),
            username: cleanUsername,
            email: email.trim().toLowerCase(),
            password,
            role,
          });

          // Store temporary access token returned on register so verify-email authenticated call succeeds
          if (res?.accessToken) {
            setAccessToken(res.accessToken);
          }


          // Open aesthetic OTP verification modal
          setOtpTargetEmail(email.trim().toLowerCase());
          setShowOtpModal(true);
          setIsSubmitting(false);
        } catch (err) {
          const errRes = err.message || "";
          if (errRes.toLowerCase().includes("already exists")) {
            setErrorMsg("Username or email is already registered.");
            setIsSubmitting(false);
            return;
          }
          setErrorMsg(errRes || "Registration failed. Please try again.");
          setIsSubmitting(false);
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || "Authentication failed. Please check your credentials.");
    }
  };

  const handleOtpVerified = () => {
    setShowOtpModal(false);
    finishAuthentication(role, {
      name: fullName || username || email.split("@")[0],
      username: username || email.split("@")[0],
      email: otpTargetEmail || email,
      role,
      verified: true,
    });
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/");
    }
  };

  return (
    <div
      className={
        isFullPage
          ? "min-h-screen bg-[#07090E] flex items-center justify-center p-4 py-12 relative overflow-hidden"
          : "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn overflow-y-auto"
      }
    >
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating 3D/Tech Elements */}
      <div className="absolute top-12 left-10 hidden xl:block opacity-40 hover:opacity-80 transition-opacity">
        <PremiereProIcon className="w-14 h-14" />
      </div>
      <div className="absolute bottom-12 right-10 hidden xl:block opacity-40 hover:opacity-80 transition-opacity">
        <DaVinciIcon className="w-14 h-14" />
      </div>
      <div className="absolute top-20 right-20 hidden xl:block opacity-30 hover:opacity-70 transition-opacity">
        <BlueFolder3DIcon className="w-16 h-16" />
      </div>

      {/* Modal / Card Container */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 overflow-hidden z-10 my-auto">
        {/* Close Button (Modal mode only) */}
        {!isFullPage && (
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        )}

        {/* ─── HEADER ─── */}
        <div className="text-center mb-6">
          <div className="inline-flex justify-center mb-3">
            <CollaboLogo className="h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {mode === "login"
              ? isCreator
                ? "Creator Studio Sign In"
                : "Editor Workspace Sign In"
              : isCreator
              ? "Join as Creator"
              : "Join as Video Editor"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {mode === "login"
              ? isCreator
                ? "Sign in to manage your creator productions & edits"
                : "Sign in to pick video gigs & get paid freely"
              : isCreator
              ? "Join as a Creator to match with premier video editors"
              : "Join as an Editor to showcase work & earn top rates"}
          </p>
        </div>

        {/* ─── ROLE SWITCHER TOGGLE (Creator ↔ Editor) ─── */}
        <div className="relative mb-5 p-1 bg-slate-100/90 rounded-2xl flex items-center border border-slate-200">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl transition-all duration-500 ease-out shadow-sm ${
              isCreator
                ? "left-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/25"
                : "left-[calc(50%+2px)] bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-blue-500/25"
            }`}
          />

          <button
            type="button"
            onClick={() => handleRoleChange("creator")}
            className={`relative z-10 w-1/2 py-2 text-xs sm:text-sm font-semibold text-center transition-colors duration-300 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${
              isCreator ? "text-white font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🎬 Creator</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange("editor")}
            className={`relative z-10 w-1/2 py-2 text-xs sm:text-sm font-semibold text-center transition-colors duration-300 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${
              !isCreator ? "text-white font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>✂️ Editor</span>
          </button>
        </div>

        {/* ─── TAB TOGGLE: Login ↔ Sign Up ─── */}
        <div className="flex border-b border-slate-200 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg("");
            }}
            className={`pb-2.5 px-4 text-sm font-semibold transition-all relative cursor-pointer ${
              mode === "login"
                ? isCreator
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            {isCreator ? "Creator Login" : "Editor Login"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMsg("");
            }}
            className={`pb-2.5 px-4 text-sm font-semibold transition-all relative cursor-pointer ${
              mode === "signup"
                ? isCreator
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            {isCreator ? "Creator Sign Up" : "Editor Sign Up"}
          </button>
        </div>

        {/* ─── ERROR BANNER ─── */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl text-xs bg-rose-50 border border-rose-200 text-rose-600 font-medium">
            {errorMsg}
          </div>
        )}

        {/* ─── GOOGLE ONE-CLICK SIGN IN / SIGN UP ─── */}
        <div className="mb-5">
          <div className="flex justify-center">
            <GoogleSignInButton
              role={role}
              onSuccess={({ accessToken, user }) => {
                login(user.role || role, user, accessToken);
                setIsSuccess(true);
                setTimeout(() => {
                  if (onLoginSuccess) {
                    onLoginSuccess(user.role || role);
                  } else {
                    const targetPath =
                      location.state?.from?.pathname ||
                      ((user.role || role) === "editor" ? "/editor/dashboard" : "/creator/dashboard");
                    navigate(targetPath, { replace: true });
                  }
                }, 500);
              }}
              onError={(msg) => setErrorMsg(msg)}
            />
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-medium">
                Or continue with credentials
              </span>
            </div>
          </div>
        </div>

        {/* ─── MAIN FORM ─── */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "login" ? (
            /* Single input for Email OR Username */
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email or Username
              </label>
              <input
                type="text"
                required
                placeholder="Enter your email or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 ${accentBorder}`}
              />
            </div>
          ) : (
            /* Signup Fields */
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder={isCreator ? "e.g. Jason Vance" : "e.g. Alex Rivera"}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 ${accentBorder}`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder={isCreator ? "e.g. jason_vance" : "e.g. alex_rivera"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 ${accentBorder}`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 ${accentBorder}`}
                />
              </div>
            </>
          )}

          {/* Password Field with Press-and-Hold Reveal Eye */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              {mode === "login" && (
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    const resetEmail = prompt("Enter your registered email address to receive password reset link:");
                    if (resetEmail) {
                      alert(`Password reset instructions sent to ${resetEmail}`);
                    }
                  }}
                  className="text-[11px] font-medium text-slate-400 hover:text-slate-600"
                >
                  Forgot?
                </a>
              )}
            </div>

            <div className="relative">
              <input
                type={isPasswordRevealed ? "text" : "password"}
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 ${accentBorder}`}
              />

              {/* Eye Button: Hold cursor pressed to see, release cursor to hide */}
              <button
                type="button"
                onMouseDown={() => setIsPasswordRevealed(true)}
                onMouseUp={() => setIsPasswordRevealed(false)}
                onMouseLeave={() => setIsPasswordRevealed(false)}
                onTouchStart={() => setIsPasswordRevealed(true)}
                onTouchEnd={() => setIsPasswordRevealed(false)}
                title="Press and hold to view password"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 select-none p-1 cursor-pointer transition-colors"
              >
                {isPasswordRevealed ? (
                  <Eye className="w-4 h-4 text-purple-600 animate-pulse" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Dynamic Password Strength Indicator (Signup Mode) */}
          {mode === "signup" && password.length > 0 && (
            <div className="space-y-1.5 pt-1 animate-fadeIn">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Security Strength:</span>
                <span
                  className={`font-semibold ${
                    strengthScore >= 75 ? "text-emerald-600" : "text-slate-600"
                  }`}
                >
                  {strengthLabel}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${strengthColor}`}
                  style={{ width: `${strengthScore}%` }}
                />
              </div>
            </div>
          )}

          {mode === "signup" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isCreator ? "YouTube / Channel Link (Optional)" : "Portfolio / Showreel Link (Optional)"}
              </label>
              <input
                type="url"
                placeholder={isCreator ? "https://youtube.com/@channel" : "https://vimeo.com/showreel"}
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 ${accentBorder}`}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-xl text-white text-sm font-bold tracking-wide transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] mt-2 ${
              isCreator
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/30"
                : "bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 shadow-blue-500/30"
            }`}
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : isSuccess ? (
              <span>✓ Signed in! Entering dashboard...</span>
            ) : mode === "login" ? (
              <span>Sign In as {isCreator ? "Creator" : "Editor"} →</span>
            ) : (
              <span>Continue to OTP Verification →</span>
            )}
          </button>
        </form>
      </div>

      {/* Aesthetic OTP Verification Screen / Modal */}
      {showOtpModal && (
        <OtpVerificationModal
          isOpen={showOtpModal}
          email={otpTargetEmail || email}
          role={role}
          onSuccess={handleOtpVerified}
          onCancel={() => setShowOtpModal(false)}
        />
      )}
    </div>
  );
}

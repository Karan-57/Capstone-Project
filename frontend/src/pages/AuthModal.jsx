import React, { useState } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import CollaboLogo from "../components/landing/CollaboLogo";
import { DaVinciIcon, PremiereProIcon, BlueFolder3DIcon } from "../components/landing/SoftwareIcons";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

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
  const [role, setRole] = useState(validParamRole || initialRole); // "creator" (purple) | "editor" (blue)
  const [email, setEmail] = useState(() =>
    (validParamRole || initialRole) === "creator" ? "creator@collabo.io" : "editor@collabo.io"
  );
  const [password, setPassword] = useState("password123");
  const [fullName, setFullName] = useState(() =>
    (validParamRole || initialRole) === "creator" ? "Jason Vance" : "Alex Rivera"
  );
  const [portfolioUrl, setPortfolioUrl] = useState(() =>
    (validParamRole || initialRole) === "creator"
      ? "https://youtube.com/@jasonvance"
      : "https://vimeo.com/alexrivera/showreel"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  // Role Theme Variables
  const isCreator = role === "creator";
  const accentBorder = isCreator
    ? "focus:border-purple-500 focus:ring-purple-500/20"
    : "focus:border-blue-500 focus:ring-blue-500/20";

  // When toggling role, update search param & placeholder values
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setErrorMsg("");
    if (isFullPage && setSearchParams) {
      setSearchParams({ role: newRole });
    }
    if (newRole === "creator") {
      setEmail("creator@collabo.io");
      setFullName("Jason Vance");
      setPortfolioUrl("https://youtube.com/@jasonvance");
    } else {
      setEmail("editor@collabo.io");
      setFullName("Alex Rivera");
      setPortfolioUrl("https://vimeo.com/alexrivera/showreel");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      if (mode === "login") {
        try {
          const response = await api.post("/api/auth/login", { email, password });
          if (response?.data?.accessToken) {
            login(role, { email, role }, response.data.accessToken);
          } else {
            login(role, { email, role });
          }
        } catch (err) {
          console.warn("Backend login fallback to client session:", err?.response?.data?.message || err.message);
          login(role, { email, role });
        }
      } else {
        try {
          await api.post("/api/auth/register", {
            username: fullName,
            email,
            password,
            role,
            portfolioUrl,
          });
        } catch (err) {
          console.warn("Backend register fallback to client session:", err?.response?.data?.message || err.message);
        }
        login(role, { name: fullName, email, role, portfolioUrl });
      }

      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(role);
        } else {
          const targetPath =
            location.state?.from?.pathname ||
            (role === "editor" ? "/editor/dashboard" : "/creator/dashboard");
          navigate(targetPath, { replace: true });
        }
      }, 600);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || "Authentication failed. Please check your credentials.");
    }
  };

  const handleQuickDemo = (demoRole) => {
    setIsSubmitting(true);
    setRole(demoRole);
    login(demoRole, { email: demoRole === "editor" ? "editor@collabo.io" : "creator@collabo.io", role: demoRole });
    setTimeout(() => {
      setIsSubmitting(false);
      if (onLoginSuccess) {
        onLoginSuccess(demoRole);
      } else {
        navigate(demoRole === "editor" ? "/editor/dashboard" : "/creator/dashboard", { replace: true });
      }
    }, 400);
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
      className={`${
        isFullPage
          ? "min-h-screen relative flex flex-col items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xl overflow-hidden"
          : "fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-950/60 backdrop-blur-xl transition-all duration-500 animate-fadeIn"
      }`}
    >
      {/* Ambient background floating 3D software icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-[8%] left-[8%] md:left-[12%] animate-float-slow opacity-25 filter blur-[2px]">
          <PremiereProIcon size={72} />
        </div>
        <div className="absolute bottom-[10%] left-[10%] md:left-[15%] animate-float-subtle opacity-25 filter blur-[2px]">
          <BlueFolder3DIcon size={84} />
        </div>
        <div className="absolute top-[12%] right-[8%] md:right-[14%] animate-float-subtle opacity-25 filter blur-[2px]">
          <DaVinciIcon size={76} />
        </div>
        <div className="absolute bottom-[8%] right-[8%] md:right-[12%] animate-float-slow opacity-25 filter blur-[2px]">
          <BlueFolder3DIcon size={84} />
        </div>
      </div>

      {/* Full Page Navigation Header */}
      {isFullPage && (
        <div className="w-full max-w-[480px] flex items-center justify-between mb-4 px-2 relative z-20">
          <Link
            to="/"
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            Unified Authentication
          </span>
        </div>
      )}

      {/* Auth Card Container with 500ms spring role transition */}
      <div
        className="relative w-full max-w-[480px] bg-white/95 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-white/80 backdrop-blur-2xl transition-all duration-500 transform ease-out z-10"
        style={{
          boxShadow: isCreator
            ? "0 25px 60px -15px rgba(168, 85, 247, 0.25), 0 0 0 1px rgba(168, 85, 247, 0.2)"
            : "0 25px 60px -15px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.2)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-block mb-3">
            <CollaboLogo size={48} variant="isometric" animated={true} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            {mode === "login" ? "Welcome back" : "Create an account"}
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
        <div className="relative mb-6 p-1 bg-slate-100/90 rounded-2xl flex items-center border border-slate-200">
          {/* Sliding Pill Indicator with Spring Motion */}
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
        <div className="flex border-b border-slate-200 mb-6">
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
            {isCreator ? "Creator Signup" : "Editor Signup"}
          </button>
        </div>

        {/* Error message alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-fadeIn">
            {errorMsg}
          </div>
        )}

        {/* ─── FORM ─── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
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
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder={isCreator ? "creator@collabo.io" : "editor@collabo.io"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 ${accentBorder}`}
            />
          </div>

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
                    alert("Demo Account: Use password123 to log in instantly.");
                  }}
                  className="text-[11px] font-medium text-slate-400 hover:text-slate-600"
                >
                  Forgot?
                </a>
              )}
            </div>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 ${accentBorder}`}
            />
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
                {isCreator ? "YouTube / Channel / Portfolio Link" : "Showreel / Portfolio / DaVinci Link"}
              </label>
              <input
                type="url"
                placeholder={
                  isCreator ? "https://youtube.com/@channel" : "https://vimeo.com/showreel"
                }
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
            className={`w-full py-3 px-4 rounded-xl text-white text-sm font-bold tracking-wide transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] ${
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
              <span>Create {isCreator ? "Creator" : "Editor"} Account →</span>
            )}
          </button>
        </form>

        {/* ─── QUICK 1-CLICK DEMO LOGIN (INSTANT ACCESS) ─── */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-slate-400">Quick Demo Access:</span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleQuickDemo("creator")}
              className="flex-1 sm:flex-none text-xs px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold border border-purple-200 transition-colors cursor-pointer"
            >
              Demo Creator ➔
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("editor")}
              className="flex-1 sm:flex-none text-xs px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 transition-colors cursor-pointer"
            >
              Demo Editor ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

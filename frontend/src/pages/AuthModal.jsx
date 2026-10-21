import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams, Link } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, Video, Briefcase } from "lucide-react";
import CollaboLogo from "../components/landing/CollaboLogo";
import { DaVinciIcon, PremiereProIcon, BlueFolder3DIcon } from "../components/landing/SoftwareIcons";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import { login as loginApi, register as registerApi } from "../services/auth.api";
import { setAccessToken } from "../services/api";
import OtpVerificationModal from "./auth/OtpVerificationModal";
import GoogleSignInButton from "../components/common/GoogleSignInButton";
import LegalModal from "./legal/LegalModal";
import ForgotPasswordModal from "../components/auth/ForgotPasswordModal";
import creatorArtImg from "../assets/images/creator-workspace-art.jpg";
import editorWorkspaceImg from "../assets/images/editor-workspace-3d.jpg";

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
  const { showAlert } = useAlert();

  // URL search params override initialRole if present
  const paramRole = searchParams?.get("role");
  const normalizedParamRole = paramRole === "freelancer" ? "editor" : paramRole;
  const validParamRole = normalizedParamRole === "editor" || normalizedParamRole === "creator" ? normalizedParamRole : null;

  const [mode, setMode] = useState(() => {
    if (location.pathname === "/signup" || location.pathname.includes("signup")) return "signup";
    return initialMode || "login";
  });
  const [role, setRole] = useState(validParamRole || initialRole); // "creator" | "editor"

  // Sync mode whenever initialMode or URL path changes
  useEffect(() => {
    if (location.pathname === "/signup" || location.pathname.includes("signup")) {
      setMode("signup");
    } else if (location.pathname === "/login" || location.pathname.includes("login")) {
      setMode("login");
    } else if (initialMode) {
      setMode(initialMode);
    }
  }, [location.pathname, initialMode]);

  // Sync role when query param or initialRole changes
  useEffect(() => {
    if (validParamRole) {
      setRole(validParamRole);
    } else if (initialRole) {
      setRole(initialRole);
    }
  }, [validParamRole, initialRole]);

  // Inputs
  const [identifier, setIdentifier] = useState(""); // email or username for login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(null); // 'terms' | 'privacy' | null

  // Password visibility state: shown only while cursor is pressed / held down
  const [isPasswordRevealed, setIsPasswordRevealed] = useState(false);

  // OTP Verification Modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpTargetEmail, setOtpTargetEmail] = useState("");
  const [otpCooldownRemaining, setOtpCooldownRemaining] = useState(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  // Role Theme Variables
  const isCreator = role === "creator";

  // When toggling role, update search param
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setErrorMsg("");
    if (isFullPage && setSearchParams) {
      setSearchParams({ role: newRole });
    }
  };

  // When toggling mode (login ↔ signup), update state and URL route in full page
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setErrorMsg("");
    if (isFullPage) {
      const currentRole = role || "creator";
      navigate(`/${newMode}?role=${currentRole}`, { replace: true });
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
            if (err.data?.accessToken) {
              setAccessToken(err.data.accessToken);
            }
            if (typeof err.data?.cooldownRemaining === "number") {
              setOtpCooldownRemaining(err.data.cooldownRemaining);
            }
            const targetEmail = err.data?.email || (identifier.includes("@") ? identifier.trim() : "");
            setOtpTargetEmail(targetEmail);
            setShowOtpModal(true);
            setIsSubmitting(false);
            return;
          }
          if (err.status === 401 || errRes.toLowerCase().includes("invalid credentials")) {
            setErrorMsg("Invalid username/email or password.");
            setIsSubmitting(false);
            return;
          }
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

        if (!agreedToTerms) {
          setErrorMsg("Please accept the Terms & Conditions and Privacy Policy to continue.");
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

          if (res?.accessToken) {
            setAccessToken(res.accessToken);
          }

          if (typeof res?.cooldownRemaining === "number") {
            setOtpCooldownRemaining(res.cooldownRemaining);
          }

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
          ? "min-h-screen bg-[#FDEBDE] text-[#382322] flex flex-col items-center justify-center p-4 py-8 sm:py-12 relative overflow-hidden selection:bg-[#FFEBAA] selection:text-[#382322]"
          : "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto text-[#382322] selection:bg-[#FFEBAA] selection:text-[#382322]"
      }
    >
      {/* ─── ROLE-SPECIFIC BACKGROUND DESIGNER ARTWORK (LOW OPACITY) ─── */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden flex items-center justify-center">
        {/* Paper Grain Base */}
        <div className="absolute inset-0 paper-grain opacity-50" />

        {/* Ambient Warm Color Blurs */}
        <div
          className={`absolute w-[600px] h-[600px] rounded-full blur-3xl transition-all duration-700 ${
            isCreator ? "bg-[#FFEBAA]/45 top-[-100px] left-[-100px]" : "bg-[#B1C8EA]/45 top-[-100px] right-[-100px]"
          }`}
        />

        {/* Role-Specific Artwork Floating Behind with Low Opacity */}
        <div
          className="relative w-full max-w-4xl h-full max-h-[850px] flex items-center justify-center transition-all duration-700 ease-out"
          style={{
            transform: isCreator ? "scale(1.02) rotate(-1deg)" : "scale(1.02) rotate(1deg)",
          }}
        >
          {isCreator ? (
            /* Creator Artwork: Workspace Tablet Artist */
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={creatorArtImg}
                alt="Creator Workspace Art"
                className="w-full max-w-2xl h-auto object-contain opacity-15 filter contrast-110 grayscale-[30%] mix-blend-multiply"
              />
              {/* Creator Editorial Annotations */}
              <div className="absolute top-16 left-8 font-hand text-lg font-bold text-[#382322]/50 rotate-[-4deg] hidden md:block">
                "vision • timeline • storyboard"
              </div>
              <div className="absolute bottom-20 right-8 font-mono text-[11px] font-bold text-[#382322]/50 tracking-wider hidden md:block">
                STUDIO DISPATCH № 01
              </div>
            </div>
          ) : (
            /* Editor Artwork: 3D Video Editing Suite Floating Workstation */
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={editorWorkspaceImg}
                alt="Editor Video Suite 3D Workstation"
                className="w-full max-w-2xl h-auto object-contain opacity-20 filter contrast-115 grayscale-[15%] mix-blend-multiply"
              />
              {/* Editor Editorial Annotations */}
              <div className="absolute top-16 right-8 font-hand text-lg font-bold text-[#382322]/50 rotate-[3deg] hidden md:block">
                "cut at frame 00:04:12" ✂
              </div>
              <div className="absolute bottom-20 left-8 font-mono text-[11px] font-bold text-[#382322]/50 tracking-wider hidden md:block">
                AUDIO CURVE • PRORES 4K
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating 3D Editor & Creator Artwork Emblems */}
      <div className="absolute top-8 left-8 hidden lg:block opacity-65 hover:opacity-100 transition-opacity">
        <div className="p-2 rounded-2xl bg-[#FFF9F3] border-2 border-[#382322] shadow-[3px_3px_0_#382322] rotate-[-5deg]">
          <PremiereProIcon size={46} />
        </div>
      </div>
      <div className="absolute bottom-8 right-8 hidden lg:block opacity-65 hover:opacity-100 transition-opacity">
        <div className="p-2 rounded-2xl bg-[#FFF9F3] border-2 border-[#382322] shadow-[3px_3px_0_#382322] rotate-[4deg]">
          <DaVinciIcon size={46} />
        </div>
      </div>
      <div className="absolute top-12 right-12 hidden lg:block opacity-60 hover:opacity-100 transition-opacity">
        <div className="p-2 rounded-2xl bg-[#FFF9F3] border-2 border-[#382322] shadow-[3px_3px_0_#382322] rotate-[3deg]">
          <BlueFolder3DIcon size={48} />
        </div>
      </div>

      {/* ─── MAIN MODAL / LOGIN CARD CONTAINER ─── */}
      <div className="relative w-full max-w-md bg-[#FFF9F3] rounded-3xl border-2 border-[#382322] shadow-[6px_6px_0_#382322] p-6 sm:p-8 z-10 my-auto transition-all duration-300">
        {/* Top Analog Washi Tape */}
        <div
          className={`absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-4.5 border border-[#382322]/40 shadow-xs pointer-events-none transition-all duration-300 ${
            isCreator ? "bg-[#FFEBAA] rotate-[-1deg]" : "bg-[#B1C8EA] rotate-[1.5deg]"
          }`}
        />

        {/* Corner Role Stamp Badge */}
        <div
          className={`absolute top-4 right-5 px-2 py-0.5 rounded-md font-mono text-[9px] font-extrabold uppercase tracking-wider border border-[#382322] shadow-xs select-none ${
            isCreator ? "bg-[#FFEBAA] text-[#382322]" : "bg-[#B1C8EA] text-[#382322]"
          }`}
        >
          {isCreator ? "CREATOR PORTAL" : "EDITOR SUITE"}
        </div>

        {/* Close Button (Modal mode only) */}
        {!isFullPage && (
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 left-4 text-[#382322] hover:bg-[#FDEBDE] p-1.5 rounded-full border border-[#382322]/30 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        )}

        {/* ─── HEADER ─── */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex justify-center mb-2">
            <CollaboLogo size={42} variant="isometric" animated={true} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#382322] font-display tracking-tight transition-all duration-300">
            {mode === "login" ? (
              isCreator ? (
                <>Creator <span className="italic font-serif">Studio</span> Sign In</>
              ) : (
                <>Freelancer <span className="italic font-serif">Studio</span> Sign In</>
              )
            ) : isCreator ? (
              <>Join as <span className="italic font-serif">Creator</span></>
            ) : (
              <>Join as <span className="italic font-serif">Freelancer</span></>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-[#382322]/75 mt-1 transition-all duration-300 font-medium">
            {mode === "login"
              ? isCreator
                ? "Sign in to manage your creator productions & track escrow"
                : "Sign in to pick gigs, submit deliverables & get paid"
              : isCreator
              ? "Hire top video editors, thumbnail designers & creative talent"
              : "For video editors, thumbnail designers, animators & creators"}
          </p>
        </div>

        {/* ─── ROLE SWITCHER TOGGLE (Creator ↔ Freelancer) ─── */}
        <div className="relative mb-4 p-1 bg-[#FDEBDE] rounded-2xl flex items-center border-2 border-[#382322] shadow-[2px_2px_0_#382322]">
          <button
            type="button"
            onClick={() => handleRoleChange("creator")}
            className={`w-1/2 py-2 text-xs sm:text-sm font-extrabold text-center transition-all duration-200 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${
              isCreator
                ? "bg-[#FFEBAA] text-[#382322] border border-[#382322] shadow-[1px_1px_0_#382322]"
                : "text-[#382322]/70 hover:text-[#382322]"
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Creator</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange("editor")}
            className={`w-1/2 py-2 text-xs sm:text-sm font-extrabold text-center transition-all duration-200 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${
              !isCreator
                ? "bg-[#B1C8EA] text-[#382322] border border-[#382322] shadow-[1px_1px_0_#382322]"
                : "text-[#382322]/70 hover:text-[#382322]"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Freelancer</span>
          </button>
        </div>

        {/* ─── TAB TOGGLE: Login ↔ Sign Up ─── */}
        <div className="relative mb-5 p-1 bg-[#FDEBDE]/60 rounded-xl flex items-center border border-[#382322]/30">
          <button
            type="button"
            onClick={() => handleModeChange("login")}
            className={`w-1/2 py-1.5 text-xs sm:text-sm font-bold text-center transition-all duration-200 rounded-lg flex items-center justify-center cursor-pointer ${
              mode === "login"
                ? "bg-[#FFF9F3] text-[#382322] border border-[#382322] shadow-[1px_1px_0_#382322]"
                : "text-[#382322]/60 hover:text-[#382322]"
            }`}
          >
            {isCreator ? "Creator Sign In" : "Freelancer Sign In"}
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("signup")}
            className={`w-1/2 py-1.5 text-xs sm:text-sm font-bold text-center transition-all duration-200 rounded-lg flex items-center justify-center cursor-pointer ${
              mode === "signup"
                ? "bg-[#FFF9F3] text-[#382322] border border-[#382322] shadow-[1px_1px_0_#382322]"
                : "text-[#382322]/60 hover:text-[#382322]"
            }`}
          >
            {isCreator ? "Creator Sign Up" : "Freelancer Sign Up"}
          </button>
        </div>

        {/* ─── ERROR BANNER ─── */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl text-xs bg-[#FFEBAA] border-2 border-[#382322] text-[#382322] font-bold flex items-center gap-2 shadow-[2px_2px_0_#382322] animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#382322]" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {/* ─── GOOGLE ONE-CLICK SIGN IN / SIGN UP ─── */}
        <div className="mb-4">
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
              <div className="w-full border-t border-[#382322]/20" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-[#FFF9F3] px-3 font-mono font-bold text-[#382322]/60 uppercase">
                Or continue with credentials
              </span>
            </div>
          </div>
        </div>

        {/* ─── MAIN FORM ─── */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Email or Username input (shown in Login mode) */}
          {mode === "login" && (
            <div className="animate-fadeIn">
              <label className="block text-[11px] font-mono font-bold text-[#382322] uppercase tracking-wider mb-1">
                Email or Username
              </label>
              <input
                type="text"
                required
                placeholder="Enter your email or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#FFFDF9] border-2 border-[#382322] text-[#261615] placeholder:text-[#382322]/40 outline-none shadow-[2px_2px_0_#382322]/15 focus:shadow-[2px_2px_0_#382322] focus:border-[#382322] transition-all"
              />
            </div>
          )}

          {/* Additional Signup Fields */}
          <div
            className={`overflow-hidden transition-all duration-400 ${
              mode === "signup"
                ? "max-h-[380px] opacity-100 space-y-3.5"
                : "max-h-0 opacity-0 pointer-events-none"
            }`}
          >
            <div>
              <label className="block text-[11px] font-mono font-bold text-[#382322] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required={mode === "signup"}
                placeholder={isCreator ? "e.g. Jason Vance" : "e.g. Alex Rivera"}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#FFFDF9] border-2 border-[#382322] text-[#261615] placeholder:text-[#382322]/40 outline-none shadow-[2px_2px_0_#382322]/15 focus:shadow-[2px_2px_0_#382322] focus:border-[#382322] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-[#382322] uppercase tracking-wider mb-1">
                Username
              </label>
              <input
                type="text"
                required={mode === "signup"}
                placeholder={isCreator ? "e.g. jason_vance" : "e.g. alex_rivera"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#FFFDF9] border-2 border-[#382322] text-[#261615] placeholder:text-[#382322]/40 outline-none shadow-[2px_2px_0_#382322]/15 focus:shadow-[2px_2px_0_#382322] focus:border-[#382322] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-[#382322] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required={mode === "signup"}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#FFFDF9] border-2 border-[#382322] text-[#261615] placeholder:text-[#382322]/40 outline-none shadow-[2px_2px_0_#382322]/15 focus:shadow-[2px_2px_0_#382322] focus:border-[#382322] transition-all"
              />
            </div>
          </div>

          {/* Password Field with Press-and-Hold Reveal Eye */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-mono font-bold text-[#382322] uppercase tracking-wider">
                Password
              </label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsForgotModalOpen(true);
                  }}
                  className="text-[11px] font-bold text-[#382322]/70 hover:text-[#382322] hover:underline transition-colors cursor-pointer"
                >
                  Forgot?
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type={isPasswordRevealed ? "text" : "password"}
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl bg-[#FFFDF9] border-2 border-[#382322] text-[#261615] placeholder:text-[#382322]/40 outline-none shadow-[2px_2px_0_#382322]/15 focus:shadow-[2px_2px_0_#382322] focus:border-[#382322] transition-all"
              />

              {/* Eye Button: Hold cursor pressed to view */}
              <button
                type="button"
                onMouseDown={() => setIsPasswordRevealed(true)}
                onMouseUp={() => setIsPasswordRevealed(false)}
                onMouseLeave={() => setIsPasswordRevealed(false)}
                onTouchStart={() => setIsPasswordRevealed(true)}
                onTouchEnd={() => setIsPasswordRevealed(false)}
                title="Press and hold to view password"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#382322] p-1 cursor-pointer transition-colors"
              >
                {isPasswordRevealed ? (
                  <Eye className="w-4 h-4 text-[#382322] animate-pulse" />
                ) : (
                  <EyeOff className="w-4 h-4 text-[#382322]/60" />
                )}
              </button>
            </div>
          </div>

          {/* Password Strength Indicator (Signup Mode) */}
          {mode === "signup" && password.length > 0 && (
            <div className="space-y-1.5 pt-1 animate-fadeIn">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#382322]/70">Security:</span>
                <span className="font-extrabold text-[#382322]">
                  {strengthLabel}
                </span>
              </div>
              <div className="w-full h-2 bg-[#FDEBDE] rounded-full border border-[#382322] overflow-hidden p-0.5">
                <div
                  className="h-full bg-[#FFEBAA] rounded-full border-r border-[#382322] transition-all duration-300"
                  style={{ width: `${strengthScore}%` }}
                />
              </div>
            </div>
          )}

          {/* Portfolio link (signup mode) */}
          <div
            className={`overflow-hidden transition-all duration-400 ${
              mode === "signup"
                ? "max-h-[100px] opacity-100"
                : "max-h-0 opacity-0 pointer-events-none"
            }`}
          >
            <div>
              <label className="block text-[11px] font-mono font-bold text-[#382322] uppercase tracking-wider mb-1">
                {isCreator ? "YouTube / Channel Link (Optional)" : "Portfolio / Showreel Link (Optional)"}
              </label>
              <input
                type="url"
                placeholder={isCreator ? "https://youtube.com/@channel" : "https://vimeo.com/showreel"}
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#FFFDF9] border-2 border-[#382322] text-[#261615] placeholder:text-[#382322]/40 outline-none shadow-[2px_2px_0_#382322]/15 focus:shadow-[2px_2px_0_#382322] focus:border-[#382322] transition-all"
              />
            </div>
          </div>

          {/* Terms Agreement Checkbox (Signup Mode) */}
          {mode === "signup" && (
            <div className="flex items-start gap-2.5 pt-2 pb-1 text-xs text-[#382322] animate-fadeIn">
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-2 border-[#382322] accent-[#382322] cursor-pointer shrink-0"
              />
              <div className="leading-relaxed text-[#382322]/85 select-none font-medium">
                <label htmlFor="agreeTerms" className="cursor-pointer">
                  I agree to Collabo's{" "}
                </label>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowLegalModal("terms");
                  }}
                  className="font-bold underline decoration-[#382322] cursor-pointer inline hover:text-[#261615]"
                >
                  Terms and Conditions
                </button>
                <span> and </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowLegalModal("privacy");
                  }}
                  className="font-bold underline decoration-[#382322] cursor-pointer inline hover:text-[#261615]"
                >
                  Privacy Policy
                </button>
                <span>.</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || (mode === "signup" && !agreedToTerms)}
            className={`w-full py-3 px-4 rounded-xl text-sm font-extrabold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 mt-2 border-2 border-[#382322] ${
              mode === "signup" && !agreedToTerms
                ? "bg-[#FDEBDE] text-[#382322]/40 border-[#382322]/30 cursor-not-allowed shadow-none select-none"
                : isCreator
                ? "text-[#FFF9F3] bg-[#382322] hover:bg-[#261615] shadow-[4px_4px_0_#FFEBAA] hover:shadow-[2px_2px_0_#FFEBAA] hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer active:scale-[0.99]"
                : "text-[#FFF9F3] bg-[#382322] hover:bg-[#261615] shadow-[4px_4px_0_#B1C8EA] hover:shadow-[2px_2px_0_#B1C8EA] hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer active:scale-[0.99]"
            }`}
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-[#FFF9F3]/40 border-t-[#FFF9F3] rounded-full animate-spin" />
            ) : isSuccess ? (
              <span>✓ Signed in! Entering dashboard...</span>
            ) : mode === "login" ? (
              <span>Sign In as {isCreator ? "Creator" : "Freelancer"} →</span>
            ) : (
              <span>Continue to OTP Verification →</span>
            )}
          </button>

          {/* Switch Mode Footer Link */}
          <div className="mt-3 pt-3 border-t border-[#382322]/15 text-center text-xs text-[#382322]/75 font-medium">
            {mode === "signup" ? (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleModeChange("login")}
                  className={`font-extrabold underline cursor-pointer hover:text-[#261615] ${
                    isCreator ? "decoration-[#FFEBAA] decoration-2" : "decoration-[#B1C8EA] decoration-2"
                  }`}
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleModeChange("signup")}
                  className={`font-extrabold underline cursor-pointer hover:text-[#261615] ${
                    isCreator ? "decoration-[#FFEBAA] decoration-2" : "decoration-[#B1C8EA] decoration-2"
                  }`}
                >
                  Sign Up
                </button>
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Aesthetic OTP Verification Modal */}
      {showOtpModal && (
        <OtpVerificationModal
          isOpen={showOtpModal}
          email={otpTargetEmail || email}
          role={role}
          initialCooldown={otpCooldownRemaining}
          onSuccess={handleOtpVerified}
          onCancel={() => setShowOtpModal(false)}
        />
      )}

      {/* Legal Modal View */}
      {showLegalModal && (
        <LegalModal
          type={showLegalModal}
          isOpen={!!showLegalModal}
          onClose={() => setShowLegalModal(null)}
          onAccept={() => {
            setAgreedToTerms(true);
            setShowLegalModal(null);
          }}
          role={role}
        />
      )}

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialEmail={identifier.includes('@') ? identifier : email}
      />
    </div>
  );
}

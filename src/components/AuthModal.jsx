import React, { useState, useEffect } from "react";
import PasswordResetModal from "./PasswordReset";
import { useAuth } from "../context/AuthContext";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

// role is now passed as a prop, not managed in modal
export default function AuthModal({ onClose, role, forceForgot }) {
  // Default role to 'user' if not provided
  const effectiveRole = role || 'user';
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(forceForgot ? false : true);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ email: "", password: "", confirmPassword: "" });
  const [signupStep, setSignupStep] = useState(0); // 0: form, 1: verify email, 2: complete
  const [signupVerificationCode, setSignupVerificationCode] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState(forceForgot ? 1 : 0); // 0: not open, 1: enter email, 2: check email
  const [loginErrors, setLoginErrors] = useState({});
  const [signupErrors, setSignupErrors] = useState({});
  const [forgotError, setForgotError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoginData({ email: "", password: "" });
    setSignupData({ email: "", password: "", confirmPassword: "" });
    setSignupStep(0);
    setSignupVerificationCode("");
    setForgotEmail("");
    setForgotStep(forceForgot ? 1 : 0);
    setLoginErrors({});
    setSignupErrors({});
    setForgotError("");
  }, [role, forceForgot]);

  // Login handler using AuthContext only
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginErrors({});
    const result = await login({ email: loginData.email, password: loginData.password, role: effectiveRole });
    if (result && result.success && result.user && result.user.role === effectiveRole) {
      toast.success("Welcome!");
      setLoginErrors({});
      onClose && onClose();
    } else {
      setLoginErrors({ general: (result && result.message) || "Login failed." });
    }
    setLoading(false);
  };

  // Signup step 1: Request verification code
  const handleSignupRequestVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSignupErrors({});
    if (!signupData.email) {
      setSignupErrors({ general: "Please enter your email." });
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("https://production-project-1.onrender.com/api/auth/signup/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupData.email })
      });
      const data = await res.json();
      if (!res.ok) {
        setSignupErrors({ general: data.message || "Could not send verification code." });
        setLoading(false);
        return;
      }
      setSignupStep(1);
    } catch (err) {
      setSignupErrors({ general: err.message || "Could not send verification code." });
    }
    setLoading(false);
  };

  // Signup step 2: Verify code and complete signup
  const handleSignupVerifyAndComplete = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSignupErrors({});
    if (!signupVerificationCode) {
      setSignupErrors({ general: "Please enter the verification code sent to your email." });
      setLoading(false);
      return;
    }
    if (!signupData.password || !signupData.confirmPassword) {
      setSignupErrors({ general: "Please fill all fields." });
      setLoading(false);
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      setSignupErrors({ confirmPassword: "Passwords do not match." });
      setLoading(false);
      return;
    }
    try {
      const resVerify = await fetch("https://production-project-1.onrender.com/api/auth/signup/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupData.email.split('@')[0],
          email: signupData.email,
          password: signupData.password,
          mobile: "",
          code: signupVerificationCode
        })
      });
      const dataVerify = await resVerify.json();
      if (!resVerify.ok) {
        setSignupErrors({ general: dataVerify.message || "Verification failed." });
        setLoading(false);
        return;
      }
      setSignupErrors({});
      setIsLogin(true);
      setLoginData({ email: signupData.email, password: "" });
      toast.success("Signup successful! Please log in.");
      setSignupStep(0);
      setSignupVerificationCode("");
    } catch (err) {
      setSignupErrors({ general: err.message || "Verification failed." });
    }
    setLoading(false);
  };

  // Forgot password handler using backend only
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setForgotError("");
    if (!forgotEmail) {
      setForgotError("Email is missing.");
      setLoading(false);
      return;
    }
    try {
      // Always use the same endpoint for all users (user or admin)
      const endpoint = "https://production-project-1.onrender.com/api/auth/forgot-password/send-code";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.message || "Could not send verification code.");
        setLoading(false);
        return;
      }
      setForgotStep(2); // Show message to check email
    } catch (err) {
      setForgotError(err.message || "Could not send verification code.");
    }
    setLoading(false);
  };

  return (
  <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white bg-opacity-95 p-8 rounded-2xl w-full max-w-md relative mx-2 my-8 shadow-2xl flex flex-col items-center border-2 border-purple-200" style={{backdropFilter:'blur(6px)'}}>
        <button
          className={`absolute top-2 right-2 text-xl text-gray-600 hover:text-black ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => { if (!loading) onClose && onClose(); }}
          disabled={loading}
        >
          <FaTimes />
        </button>
  <h2 className="text-2xl font-extrabold mb-6 text-center bg-blue-600 tracking-wide drop-shadow">
          {forgotStep ? "Forgot Password" : isLogin ? "Login" : "Sign Up"}
        </h2>

        {forgotStep === 1 && showPasswordReset ? (
          <div className="w-full flex flex-col items-center">
            <PasswordResetModal
              showModal={showPasswordReset}
              setShowModal={setShowPasswordReset}
              user={{ email: forgotEmail, emailVerified: true }}
              onSuccess={() => {
                setForgotStep(0);
                setForgotEmail("");
                setForgotError("");
                setShowPasswordReset(false);
                setIsLogin(true);
                toast.success("Password reset successful! Please log in.");
              }}
            />
            <button
              type="button"
              className="w-full mt-4 text-purple-600 underline font-semibold text-base hover:text-purple-800"
              onClick={() => { setForgotStep(0); setForgotEmail(""); setForgotError(""); setShowPasswordReset(false); setIsLogin(true); }}
            >
              ← Back to Login
            </button>
          </div>
        ) : forgotStep === 2 ? (
          <div className="w-full text-center flex flex-col items-center">
            <p className="text-green-700 mb-6 text-lg font-semibold">Check your email for a password reset code.</p>
            <button
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white p-2 rounded-lg font-bold hover:from-purple-600 hover:to-blue-600 transition text-base sm:text-sm shadow"
              onClick={() => { setForgotStep(0); setForgotEmail(""); setForgotError(""); setIsLogin(true); }}
            >
              ← Back to Login
            </button>
          </div>
        ) : isLogin ? (
          <>
            <form onSubmit={handleLogin} className="space-y-4 w-full">
              <input
                type="email"
                placeholder="Email"
                value={loginData.email}
                onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                className="w-full border p-2 rounded text-sm"
                autoComplete="username"
              />
              <input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full border p-2 rounded text-sm"
                autoComplete="current-password"
              />
              {loginErrors.general && <p className="text-red-600 text-sm mb-2">{loginErrors.general}</p>}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200 text-base sm:text-sm"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            <div className="my-2 w-full flex flex-col items-center">
              <button
                type="button"
                className="w-full text-blue-600 underline text-sm mt-2"
                onClick={() => { setForgotStep(1); setForgotEmail(""); setForgotError(""); setShowPasswordReset(true); }}
              >
                Forgot password?
              </button>
            </div>
          </>
        ) : (
          <>
            {signupStep === 0 && (
              <form onSubmit={handleSignupRequestVerification} className="space-y-4 w-full">
                <input
                  type="email"
                  placeholder="Email"
                  value={signupData.email}
                  onChange={e => setSignupData({ ...signupData, email: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                  autoComplete="username"
                />
                {signupErrors.general && <p className="text-red-600 text-sm mb-2">{signupErrors.general}</p>}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200 text-base sm:text-sm"
                  disabled={loading}
                >
                  {loading ? "Sending code..." : "Send Verification Code"}
                </button>
              </form>
            )}
            {signupStep === 1 && (
              <form onSubmit={handleSignupVerifyAndComplete} className="space-y-4 w-full">
                <input
                  type="text"
                  placeholder="Verification Code"
                  value={signupVerificationCode}
                  onChange={e => setSignupVerificationCode(e.target.value)}
                  className="w-full border p-2 rounded text-sm"
                  autoComplete="one-time-code"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={signupData.password}
                  onChange={e => setSignupData({ ...signupData, password: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                  autoComplete="new-password"
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={signupData.confirmPassword}
                  onChange={e => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                  autoComplete="new-password"
                />
                {signupErrors.confirmPassword && <p className="text-red-600 text-sm mt-1">{signupErrors.confirmPassword}</p>}
                {signupErrors.general && <p className="text-red-600 text-sm mb-2">{signupErrors.general}</p>}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200 text-base sm:text-sm"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Complete Signup"}
                </button>
              </form>
            )}
          </>
        )}
        <p className="text-center mt-4 text-sm">
          {forgotStep ? null : isLogin ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => { setIsLogin(false); setLoginErrors({}); }}
                className="text-blue-600 underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => { setIsLogin(true); setSignupErrors({}); }}
                className="text-blue-600 underline"
              >
                Login
              </button>
            </>
          )}
        </p>
        <div className="text-center mt-2">
          <button
            onClick={() => { if (!loading) onClose && onClose(); }}
            className={`text-gray-500 hover:text-black text-sm underline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
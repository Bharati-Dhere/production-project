import React, { useState, useEffect } from "react";
// Use your direct backend URL here:
const BACKEND_URL = "https://production-project-1.onrender.com";
// PasswordResetModal.jsx


export default function PasswordResetModal({ showModal, setShowModal, onSuccess }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset all state when modal is opened or closed
  useEffect(() => {
    if (showModal) {
      setStep(1);
      setEmail("");
      setCode("");
      setPassword("");
      setMessage("");
      setLoading(false);
    }
  }, [showModal]);

  // Auto-close only after password reset success
  useEffect(() => {
    if (step === 4 && showModal) {
      const timer = setTimeout(() => {
        setShowModal(false);
        if (onSuccess) onSuccess();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [step, setShowModal, showModal, onSuccess]);

  // Step 1: Send email code
  const handleSendCode = async () => {
    setLoading(true);
    setMessage("");
    try {
  const response = await fetch("https://production-project-1.onrender.com/api/auth/forgot-password/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
  setMessage(data.message || "Error sending code.");
        setStep(1);
        setLoading(false);
        return;
      }
      setStep(2);
      setMessage("Verification code sent to your email.");
    } catch (err) {
      setMessage(err.message || "Error sending code.");
      setStep(1);
    }
    setLoading(false);
  };

  // Step 2: Verify Code
  const handleVerifyCode = async () => {
    setLoading(true);
    setMessage("");
    try {
      // Only send email and code for verification, NOT password
      const response = await fetch("https://production-project-1.onrender.com/api/auth/forgot-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || "Invalid or expired code.");
        setLoading(false);
        return;
      }
      setStep(3);
      setMessage("Code verified. Set your new password.");
    } catch (err) {
      setMessage(err.message || "Invalid code.");
    }
    setLoading(false);
  };

  // Step 3: Set new password
  const handleSetPassword = async () => {
    setLoading(true);
    setMessage("");
    try {
  const response = await fetch("https://production-project-1.onrender.com/api/auth/forgot-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage((data.message || "Error setting password.") + (data.message && data.message.includes('Password must') ? '\nPassword must be at least 8 characters, include uppercase, lowercase, digit, and special character.' : ''));
        setLoading(false);
        return;
      }
      setStep(4);
      setMessage("Password updated successfully.");
    } catch (err) {
      setMessage(err.message || "Error setting password.");
    }
    setLoading(false);
  };

  // Render modal UI
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button
          onClick={() => {
            setShowModal(false);
            if (onSuccess) onSuccess();
          }}
          className="absolute top-2 right-3 text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center">Forgot Password</h2>

  {message && <p className={`mb-3 text-sm ${message.toLowerCase().includes('password must') || message.toLowerCase().includes('error') ? 'text-red-600' : 'text-blue-600'}`}>{message}</p>}

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 mb-3"
            />
            <button onClick={handleSendCode} disabled={loading} className="btn w-full">
              {loading ? "Sending..." : "Send Code"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border p-2 mb-3"
            />
            <button onClick={handleVerifyCode} disabled={loading} className="btn w-full">
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 mb-3"
            />
            <button onClick={handleSetPassword} disabled={loading} className="btn w-full">
              {loading ? "Setting..." : "Set Password"}
            </button>
          </>
        )}

        {step === 4 && (
          <p className="text-green-600 text-center">
            Password updated! Redirecting...
          </p>
        )}
      </div>
    </div>
  );
}

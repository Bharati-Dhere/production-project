import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuth();


  // Use AuthContext login for user login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const result = await login({ email: form.username, password: form.password, role: "user" });
    if (result && result.success && result.user && result.user.role === "user") {
      setShowPopup(true);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } else {
      setMessage(result && result.message ? result.message : "Login failed");
      setShowPopup(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">{isLogin ? "Login" : "Sign Up"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full border px-4 py-2 rounded"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          {!isLogin && (
            <input
              type="email"
              placeholder="Email"
              className="w-full border px-4 py-2 rounded"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          )}
          <input
            type="password"
            placeholder="Password"
            className="w-full border px-4 py-2 rounded"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => { setIsLogin(!isLogin); setMessage(""); }} className="text-blue-500 underline">
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>

        {message && <p className="mt-2 text-red-500 text-sm text-center">{message}</p>}
      </div>

      {showPopup && (
        <div className="fixed top-5 bg-green-500 text-white px-6 py-2 rounded shadow-lg animate-bounce">
          Login Successful!
        </div>
      )}
    </div>
  );
};

export default Auth;

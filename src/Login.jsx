import { useState } from "react";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

function Login({ onDemo }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f0f2f5",
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <div style={{
        background: "white",
        padding: "2.5rem",
        borderRadius: "12px",
        width: "360px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ marginBottom: "0.25rem", color: "#1a1a2e" }}>💑 Couple Tasks</h1>
        <p style={{ color: "#888", marginBottom: "1.5rem", fontSize: "14px" }}>
          {isSignUp ? "Create your account" : "Welcome back"}
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "8px", border: "1.5px solid #ddd", fontSize: "15px", boxSizing: "border-box" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ width: "100%", padding: "10px", marginBottom: "16px", borderRadius: "8px", border: "1.5px solid #ddd", fontSize: "15px", boxSizing: "border-box" }}
        />

        {error && <p style={{ color: "#e74c3c", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}

        <button onClick={handleSubmit} style={{
          width: "100%", padding: "11px",
          background: "#4f46e5", color: "white",
          border: "none", borderRadius: "8px",
          fontSize: "15px", cursor: "pointer",
          marginBottom: "12px"
        }}>
          {isSignUp ? "Create Account" : "Sign In"}
        </button>

        {/* DIVIDER */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "12px" }}>
          <div style={{ flex: 1, height: "1px", background: "#eee" }} />
          <span style={{ fontSize: "12px", color: "#bbb" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "#eee" }} />
        </div>

        {/* DEMO BUTTON */}
        <button onClick={onDemo} style={{
          width: "100%", padding: "11px",
          background: "white", color: "#4f46e5",
          border: "1.5px solid #4f46e5", borderRadius: "8px",
          fontSize: "15px", cursor: "pointer",
          marginBottom: "16px"
        }}>
          🎮 Try Demo
        </button>

        <p style={{ textAlign: "center", fontSize: "13px", color: "#888" }}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ color: "#4f46e5", cursor: "pointer" }}
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
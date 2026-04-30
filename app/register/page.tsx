"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push("/login?registered=true");
      } else {
        const data = await res.json();
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", textAlign: "center" }}>
      <div className="glass-card" style={{ padding: "3rem", maxWidth: "400px", width: "100%" }}>
        <h1 style={{ marginBottom: "1rem", fontSize: "2.5rem" }}>
          <i className="ri-shield-user-fill" style={{ color: "var(--primary)" }}></i> 회원가입
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2.5rem", lineHeight: "1.5" }}>
          득근의 세계로 오신 것을 환영합니다!
        </p>

        {error && <div style={{ color: "var(--primary)", marginBottom: "1rem", fontSize: "0.9rem" }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-soft)", background: "transparent", color: "var(--text-main)" }}
          />
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-soft)", background: "transparent", color: "var(--text-main)" }}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-soft)", background: "transparent", color: "var(--text-main)" }}
          />
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "1rem",
              background: "var(--primary)",
              color: "white",
              border: "none",
              padding: "1rem",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "1.1rem",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 15px rgba(244,63,94,0.3)",
            }}
          >
            {loading ? "가입 중..." : "가입하기"}
          </button>
        </form>

        <p style={{ marginTop: "2rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
          이미 계정이 있으신가요?{" "}
          <Link href="/login" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>
            로그인하기
          </Link>
        </p>
      </div>
    </main>
  );
}

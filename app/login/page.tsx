"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registeredMsg, setRegisteredMsg] = useState("");

  useEffect(() => {
    if (searchParams.get("registered")) {
      setRegisteredMsg("회원가입이 완료되었습니다! 로그인해주세요.");
    }
    if (searchParams.get("error")) {
      setError("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRegisteredMsg("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", textAlign: "center" }}>
      <div className="glass-card" style={{ padding: "3rem", maxWidth: "400px", width: "100%" }}>
        <h1 style={{ marginBottom: "1rem", fontSize: "2.5rem" }}>
          <i className="ri-fire-fill" style={{ color: "var(--primary)" }}></i> MuscleMate
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2.5rem", lineHeight: "1.5" }}>
          압도적인 근성장을 위한<br />당신의 완벽한 파트너
        </p>

        {registeredMsg && <div style={{ color: "var(--success)", marginBottom: "1rem", fontSize: "0.9rem" }}>{registeredMsg}</div>}
        {error && <div style={{ color: "var(--primary)", marginBottom: "1rem", fontSize: "0.9rem" }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
            {loading ? "로그인 중..." : "이메일로 로그인"}
          </button>
        </form>

        <div style={{ margin: "2rem 0", position: "relative", textAlign: "center" }}>
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, borderTop: "1px solid var(--border-soft)" }}></div>
          <span style={{ position: "relative", background: "var(--bg-main)", padding: "0 10px", color: "var(--text-muted)", fontSize: "0.85rem" }}>또는</span>
        </div>

        <button type="button" onClick={() => signIn("google", { callbackUrl: "/" })}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.8rem", background: "white", color: "#333", border: "none", padding: "1rem", borderRadius: "12px", fontWeight: "700", fontSize: "1.1rem", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width="24" alt="G" />
          Google로 계속하기
        </button>

        <button type="button" onClick={() => signIn("github", { callbackUrl: "/" })}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.8rem", background: "#24292e", color: "white", border: "none", padding: "1rem", borderRadius: "12px", fontWeight: "700", fontSize: "1.1rem", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginTop: "0.8rem" }}>
          <i className="ri-github-fill" style={{ fontSize: "1.5rem", lineHeight: 1 }}></i>
          GitHub로 계속하기
        </button>

        <p style={{ marginTop: "2rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
          아직 계정이 없으신가요?{" "}
          <Link href="/register" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>
            회원가입하기
          </Link>
        </p>
      </div>
    </main>
  );
}

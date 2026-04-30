"use client";

import { signIn } from "next-auth/react";

export function LoginView() {
  return (
    <main
      className="view"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        textAlign: "center",
      }}
    >
      <div className="glass-card" style={{ padding: "3rem", maxWidth: "400px", width: "100%" }}>
        <h1 style={{ marginBottom: "1rem", fontSize: "2.5rem" }}>
          <i className="ri-fire-fill" style={{ color: "var(--primary)" }}></i> CalorieFit
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2.5rem", lineHeight: "1.5" }}>
          어디서든 완벽히 동기화되는
          <br />
          나만의 다이어트 매니저
        </p>
        <button
          type="button"
          onClick={() => signIn("google")}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.8rem",
            background: "white",
            color: "#333",
            border: "none",
            padding: "1rem",
            borderRadius: "12px",
            fontWeight: "700",
            fontSize: "1.1rem",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            transition: "transform 0.2s",
          }}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
            width="24"
            alt="G"
          />
          Google로 시작하기
        </button>
        <button
          type="button"
          onClick={() => signIn("github")}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.8rem",
            background: "#24292e",
            color: "white",
            border: "none",
            padding: "1rem",
            borderRadius: "12px",
            fontWeight: "700",
            fontSize: "1.1rem",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            transition: "transform 0.2s",
            marginTop: "0.8rem",
          }}
        >
          <i className="ri-github-fill" style={{ fontSize: "1.5rem", lineHeight: "1" }}></i>
          GitHub로 시작하기
        </button>
        <button
          type="button"
          style={{
            width: "100%",
            marginTop: "1.2rem",
            background: "var(--primary)",
            color: "white",
            border: "none",
            padding: "1rem",
            borderRadius: "12px",
            fontWeight: "700",
            fontSize: "1.1rem",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(244,63,94,0.3)",
          }}
          onClick={() => signIn("credentials", { username: "테스터" })}
        >
          <i className="ri-user-smile-line" style={{ marginRight: "0.5rem" }}></i>
          테스트 계정으로 빠른 시작
        </button>
      </div>
    </main>
  );
}

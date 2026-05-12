"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const loginUser = async (e: any) => {
    e.preventDefault();
    signIn("credentials", { ...data, redirect: false }).then((callback) => {
      if (callback?.error) {
        setError(callback.error);
      }
      if (callback?.ok && !callback?.error) {
        router.push("/");
      }
    });
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '10vh' }}>
      <div className="card text-center" style={{ borderTop: '4px solid var(--blue-primary)' }}>
        <h2 className="section-title justify-center mb-2">
          <i className="ri-hospital-fill text-blue-primary"></i> CODE BLUE 로그인
        </h2>
        <p className="text-gray mb-6 text-sm">시스템 접근을 위해 로그인해 주세요.</p>
        
        <form onSubmit={loginUser}>
          <div className="form-group text-left">
            <label className="form-label">이메일 (ID)</label>
            <input
              type="email"
              className="form-input"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group text-left mb-6">
            <label className="form-label">비밀번호</label>
            <input
              type="password"
              className="form-input"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              required
            />
          </div>
          {error && <p className="text-red-primary text-sm mb-4">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            로그인
          </button>
        </form>
        <p className="mt-4 text-sm text-gray">
          계정이 없으신가요? <Link href="/register" className="text-blue-primary font-bold">회원가입</Link>
        </p>
      </div>
    </div>
  );
}

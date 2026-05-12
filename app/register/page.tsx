"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const registerUser = async (e: any) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/login");
      } else {
        const errData = await response.text();
        setError(errData);
      }
    } catch (err: any) {
      setError("Registration failed");
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '10vh' }}>
      <div className="card text-center" style={{ borderTop: '4px solid var(--blue-primary)' }}>
        <h2 className="section-title justify-center mb-2">
          <i className="ri-user-add-line text-blue-primary"></i> 회원가입
        </h2>
        <p className="text-gray mb-6 text-sm">CODE BLUE 시스템 사용을 위한 계정 생성</p>
        
        <form onSubmit={registerUser}>
          <div className="form-group text-left">
            <label className="form-label">이름</label>
            <input
              type="text"
              className="form-input"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              required
            />
          </div>
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
            등록하기
          </button>
        </form>
        <p className="mt-4 text-sm text-gray">
          이미 계정이 있으신가요? <Link href="/login" className="text-blue-primary font-bold">로그인</Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [goal, setGoal] = useState<any>(null);
  const [metric, setMetric] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetch("/api/goals").then(res => res.json()).then(data => setGoal(data.goal));
      fetch("/api/metrics").then(res => res.json()).then(data => setMetric(data.latestMetric));
    }
  }, [status, router]);

  if (status === "loading") {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>Loading...</div>;
  }

  if (!session) {
    return null; // Will redirect to login
  }

  return (
    <div id="app">
      <main className="view" style={{ paddingBottom: "2rem" }}>
        <header className="dashboard-header" style={{ justifyContent: "space-between" }}>
          <div>
            <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <i className="ri-fire-fill" style={{ color: "var(--primary)" }}></i>
              MuscleMate
            </h2>
            <p className="date-text">압도적인 근성장을 향하여</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>
                {session.user?.name}님
              </span>
              <button
                type="button"
                onClick={() => signOut()}
                style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer", padding: 0, marginTop: "0.2rem" }}
              >
                <i className="ri-logout-box-r-line"></i> 로그아웃
              </button>
            </div>
          </div>
        </header>

        <div className="dashboard-grid" style={{ marginTop: "1rem" }}>
          
          {/* Metrics Display */}
          <div className="glass-card" style={{ gridColumn: "1 / -1", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, color: "var(--primary)" }}><i className="ri-line-chart-line"></i> 나의 체성분 상태</h3>
              <Link href="/setup" style={{ fontSize: "0.85rem", color: "white", background: "var(--primary)", padding: "0.4rem 0.8rem", borderRadius: "8px", textDecoration: "none", fontWeight: "600" }}>
                목표 설정
              </Link>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", textAlign: "center" }}>
              <div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>체중</p>
                <p style={{ fontSize: "1.2rem", fontWeight: "700" }}>{metric?.weight ? `${metric.weight}kg` : "-"}</p>
                {goal?.targetWeight && <p style={{ fontSize: "0.75rem", color: "var(--primary)", marginTop: "0.3rem" }}>목표 {goal.targetWeight}kg</p>}
              </div>
              <div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>골격근량</p>
                <p style={{ fontSize: "1.2rem", fontWeight: "700" }}>{metric?.muscleMass ? `${metric.muscleMass}kg` : "-"}</p>
                {goal?.targetMuscleMass && <p style={{ fontSize: "0.75rem", color: "var(--success)", marginTop: "0.3rem" }}>목표 {goal.targetMuscleMass}kg</p>}
              </div>
              <div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>체지방률</p>
                <p style={{ fontSize: "1.2rem", fontWeight: "700" }}>{metric?.bodyFat ? `${metric.bodyFat}%` : "-"}</p>
                {goal?.targetBodyFat && <p style={{ fontSize: "0.75rem", color: "var(--primary)", marginTop: "0.3rem" }}>목표 {goal.targetBodyFat}%</p>}
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ gridColumn: "1 / -1", background: "linear-gradient(135deg, rgba(244,63,94,0.1) 0%, rgba(0,0,0,0) 100%)", border: "1px solid rgba(244,63,94,0.2)" }}>
            <h3 style={{ marginBottom: "0.5rem" }}>오늘의 추천 루틴 🔥</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              당신의 성장을 극대화할 최적의 루틴을 만나보세요.
            </p>
            <Link href="/routines" style={{ display: "inline-block", background: "var(--primary)", color: "white", padding: "0.8rem 1.5rem", borderRadius: "8px", textDecoration: "none", fontWeight: "600", fontSize: "0.9rem" }}>
              루틴 보러가기 <i className="ri-arrow-right-line"></i>
            </Link>
          </div>

          <div className="glass-card" style={{ gridColumn: "1 / -1" }}>
            <h3 style={{ marginBottom: "0.5rem", color: "var(--success)" }}>근성장 필수 아이템 🛒</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              운동 후 단백질 보충은 필수입니다. 검증된 식단을 만나보세요.
            </p>
            <Link href="/store" style={{ display: "inline-block", background: "var(--bg-card)", border: "1px solid var(--border-soft)", color: "var(--text-main)", padding: "0.8rem 1.5rem", borderRadius: "8px", textDecoration: "none", fontWeight: "600", fontSize: "0.9rem" }}>
              스토어 구경하기 <i className="ri-shopping-cart-2-line"></i>
            </Link>
          </div>
        </div>
      </main>

      <nav id="bottom-nav" className="bottom-nav">
        <Link href="/" className="nav-item active" style={{ textDecoration: "none" }}>
          <i className="ri-home-smile-fill"></i>
          <span>홈</span>
        </Link>
        <Link href="/routines" className="nav-item" style={{ textDecoration: "none" }}>
          <i className="ri-file-list-3-line"></i>
          <span>루틴</span>
        </Link>
        <Link href="/history" className="nav-item" style={{ textDecoration: "none" }}>
          <i className="ri-calendar-check-line"></i>
          <span>기록</span>
        </Link>
        <Link href="/store" className="nav-item" style={{ textDecoration: "none" }}>
          <i className="ri-shopping-bag-3-line"></i>
          <span>스토어</span>
        </Link>
      </nav>
    </div>
  );
}

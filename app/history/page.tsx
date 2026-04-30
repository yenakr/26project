"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetch("/api/workout-log")
        .then(res => res.json())
        .then(data => {
          setLogs(data.logs);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>Loading...</div>;
  }

  return (
    <div id="app">
      <main className="view" style={{ paddingBottom: "6rem" }}>
        <header className="dashboard-header" style={{ justifyContent: "center", padding: "1.5rem 1rem" }}>
          <h2>💪 오운완 기록 달력</h2>
        </header>

        <div style={{ padding: "1rem" }}>
          <div className="glass-card" style={{ padding: "1.5rem", textAlign: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>이번 달 운동 횟수</h3>
            <p style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--primary)" }}>{logs.length}회</p>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>멋진 꾸준함입니다! 계속 달려봐요!</p>
          </div>

          <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", paddingLeft: "0.5rem" }}>활동 내역</h3>
          
          {logs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
              <i className="ri-calendar-event-line" style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}></i>
              <p>아직 기록된 운동이 없습니다.<br/>첫 운동을 시작해볼까요?</p>
              <Link href="/routines" style={{ display: "inline-block", marginTop: "1rem", color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>
                루틴 보러가기 <i className="ri-arrow-right-line"></i>
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {logs.map((log) => (
                <div key={log.id} className="glass-card" style={{ padding: "1.2rem", display: "flex", alignItems: "center", gap: "1rem", border: "1px solid var(--border-soft)" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "12px", background: "rgba(244,63,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontSize: "1.5rem" }}>
                    <i className="ri-checkbox-circle-fill"></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: "1rem", marginBottom: "0.2rem" }}>{log.routineName}</h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {new Date(log.date).toLocaleDateString("ko-KR", { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.8rem", background: "var(--bg-main)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: "600" }}>
                      {log.durationMins}분
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <nav id="bottom-nav" className="bottom-nav">
        <Link href="/" className="nav-item" style={{ textDecoration: "none" }}>
          <i className="ri-home-smile-line"></i>
          <span>홈</span>
        </Link>
        <Link href="/routines" className="nav-item" style={{ textDecoration: "none" }}>
          <i className="ri-file-list-3-line"></i>
          <span>루틴</span>
        </Link>
        <Link href="/history" className="nav-item active" style={{ textDecoration: "none" }}>
          <i className="ri-calendar-check-fill"></i>
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

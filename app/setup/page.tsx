"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function SetupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(false);
  const [metricWeight, setMetricWeight] = useState("");
  const [metricMuscle, setMetricMuscle] = useState("");
  const [metricFat, setMetricFat] = useState("");

  const [goalWeight, setGoalWeight] = useState("");
  const [goalMuscle, setGoalMuscle] = useState("");
  const [goalFat, setGoalFat] = useState("");
  
  const [toastMsg, setToastMsg] = useState("");

  const handleRecommend = () => {
    if (!metricWeight || !metricMuscle || !metricFat) {
      setToastMsg("먼저 현재 인바디 상태를 모두 입력해주세요!");
      setTimeout(() => setToastMsg(""), 3000);
      return;
    }
    
    const weight = parseFloat(metricWeight);
    const muscle = parseFloat(metricMuscle);
    const fat = parseFloat(metricFat);

    // AI Recommendation Logic (Simple Heuristics)
    // 1. Muscle: +2kg
    // 2. Fat %: -3% (if > 12%), otherwise keep
    // 3. Weight: +1kg (assuming muscle gain and some fat loss)
    
    const recMuscle = (muscle + 2.0).toFixed(1);
    const recFat = fat > 12 ? (fat - 3.0).toFixed(1) : fat.toFixed(1);
    const recWeight = (weight + 1.0).toFixed(1);

    setGoalMuscle(recMuscle);
    setGoalFat(recFat);
    setGoalWeight(recWeight);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Save current metrics
      await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: metricWeight, muscleMass: metricMuscle, bodyFat: metricFat })
      });

      // 2. Save goals
      await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetWeight: goalWeight, targetMuscleMass: goalMuscle, targetBodyFat: goalFat })
      });

      setToastMsg("목표가 성공적으로 저장되었습니다! 득근을 기원합니다 💪");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      setToastMsg("오류가 발생했습니다.");
      setTimeout(() => setToastMsg(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (status !== "authenticated") return null;

  return (
    <div id="app">
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{ position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", background: "var(--text-main)", color: "var(--bg-main)", padding: "1rem 2rem", borderRadius: "30px", fontWeight: "600", zIndex: 9999, boxShadow: "0 10px 25px rgba(0,0,0,0.2)", animation: "fadeInDown 0.3s ease-out" }}>
          {toastMsg}
        </div>
      )}
      
      <main className="view" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem 1rem" }}>
        <div className="glass-card" style={{ maxWidth: "500px", width: "100%", padding: "2rem" }}>
          <h2 style={{ textAlign: "center", color: "var(--primary)", marginBottom: "0.5rem" }}>
            <i className="ri-medal-fill"></i> 나의 득근 목표 설정
          </h2>
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "2rem" }}>
            현재 상태와 달성하고 싶은 목표를 입력해주세요.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            {/* Current Metrics */}
            <div>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-soft)", paddingBottom: "0.5rem" }}>
                1. 현재 나의 인바디 상태
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>체중 (kg)</label>
                  <input type="number" step="0.1" value={metricWeight} onChange={e => setMetricWeight(e.target.value)} required placeholder="예: 70" style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border-soft)", background: "var(--bg-main)", color: "var(--text-main)" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>골격근량 (kg)</label>
                  <input type="number" step="0.1" value={metricMuscle} onChange={e => setMetricMuscle(e.target.value)} required placeholder="예: 32" style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border-soft)", background: "var(--bg-main)", color: "var(--text-main)" }} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>체지방률 (%)</label>
                  <input type="number" step="0.1" value={metricFat} onChange={e => setMetricFat(e.target.value)} required placeholder="예: 18" style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border-soft)", background: "var(--bg-main)", color: "var(--text-main)" }} />
                </div>
              </div>
            </div>

            {/* Goals */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid var(--border-soft)", paddingBottom: "0.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", margin: 0 }}>
                  2. 이루고 싶은 목표
                </h3>
                <button type="button" onClick={handleRecommend} style={{ background: "rgba(244,63,94,0.1)", color: "var(--primary)", border: "none", padding: "0.4rem 0.8rem", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <i className="ri-magic-line"></i> AI 추천 목표
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>목표 체중 (kg)</label>
                  <input type="number" step="0.1" value={goalWeight} onChange={e => setGoalWeight(e.target.value)} required placeholder="예: 75" style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border-soft)", background: "var(--bg-main)", color: "var(--text-main)" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>목표 골격근량 (kg)</label>
                  <input type="number" step="0.1" value={goalMuscle} onChange={e => setGoalMuscle(e.target.value)} required placeholder="예: 35" style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border-soft)", background: "var(--bg-main)", color: "var(--text-main)" }} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>목표 체지방률 (%)</label>
                  <input type="number" step="0.1" value={goalFat} onChange={e => setGoalFat(e.target.value)} required placeholder="예: 12" style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border-soft)", background: "var(--bg-main)", color: "var(--text-main)" }} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "none", background: "var(--primary)", color: "white", fontWeight: "700", fontSize: "1.1rem", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "저장 중..." : "목표 등록 완료"}
            </button>
            <button type="button" onClick={() => router.back()} style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-soft)", background: "transparent", color: "var(--text-muted)", fontWeight: "600", cursor: "pointer", marginTop: "-1rem" }}>
              취소
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

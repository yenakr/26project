"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RoutinesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("전체");
  
  // Dummy data for routines
  const [routines, setRoutines] = useState([
    { id: "1", title: "스트렝스 5x5 프로그램", description: "초보자부터 중급자까지 폭발적인 근력 향상과 근비대를 위한 전신 루틴", targetMuscle: "전신", splitType: "무분할", difficulty: "중급", liked: false },
    { id: "2", title: "3분할 - 가슴/삼두 (Push)", description: "주 6일 훈련자를 위한 이상적인 근비대 루틴 - 밀기 운동 집중", targetMuscle: "가슴", splitType: "3분할", difficulty: "고급", liked: true },
    { id: "3", title: "3분할 - 등/이두 (Pull)", description: "넓은 등판을 만들기 위한 당기기 집중 훈련", targetMuscle: "등", splitType: "3분할", difficulty: "중급", liked: false },
    { id: "4", title: "3분할 - 하체/어깨 (Legs)", description: "강력한 하체와 프레임을 넓히는 어깨 훈련", targetMuscle: "하체", splitType: "3분할", difficulty: "고급", liked: false },
    { id: "5", title: "2분할 - 상체 집중", description: "주 4일 운동 가능한 직장인을 위한 상체 전체 루틴", targetMuscle: "상체", splitType: "2분할", difficulty: "초중급", liked: false },
    { id: "6", title: "어깨 깡패 루틴", description: "전면, 측면, 후면 삼각근을 골고루 타격하는 어깨 집중 훈련", targetMuscle: "어깨", splitType: "부위별", difficulty: "중급", liked: false },
  ]);

  const categories = ["전체", "2분할", "3분할", "상체", "하체", "가슴", "등", "어깨"];

  const filteredRoutines = activeCategory === "전체" 
    ? routines 
    : routines.filter(r => r.splitType === activeCategory || r.targetMuscle === activeCategory);

  const toggleLike = (id: string) => {
    setRoutines(routines.map(r => r.id === id ? { ...r, liked: !r.liked } : r));
  };

  const handleStartWorkout = (id: string) => {
    router.push(`/workout/${id}`);
  };

  return (
    <div id="app">
      <main className="view" style={{ paddingBottom: "6rem" }}>
        <header className="dashboard-header" style={{ justifyContent: "center", padding: "1.5rem 1rem" }}>
          <h2>🏋️ 근성장 루틴 추천</h2>
        </header>

        {/* Categories Scroller */}
        <div style={{ display: "flex", overflowX: "auto", padding: "0.5rem 1rem", gap: "0.5rem", WebkitOverflowScrolling: "touch", msOverflowStyle: "none", scrollbarWidth: "none" }}>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                whiteSpace: "nowrap",
                padding: "0.5rem 1rem",
                borderRadius: "20px",
                border: activeCategory === cat ? "none" : "1px solid var(--border-soft)",
                background: activeCategory === cat ? "var(--primary)" : "transparent",
                color: activeCategory === cat ? "white" : "var(--text-muted)",
                fontSize: "0.85rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ padding: "1rem" }}>
          <p className="subtitle" style={{ textAlign: "center", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            {session?.user?.name || "회원"}님의 목표에 맞는 루틴을 선택하세요!
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filteredRoutines.map((routine) => (
              <div key={routine.id} className="glass-card" style={{ padding: "1.5rem", border: "1px solid var(--border-soft)", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.7rem", background: "rgba(244,63,94,0.1)", color: "var(--primary)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: "700" }}>{routine.difficulty}</span>
                      <span style={{ fontSize: "0.7rem", background: "rgba(16,185,129,0.1)", color: "var(--success)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: "700" }}>{routine.splitType}</span>
                    </div>
                    <h3 style={{ fontSize: "1.1rem", color: "var(--text-main)", marginBottom: "0.5rem" }}>{routine.title}</h3>
                  </div>
                  <button onClick={() => toggleLike(routine.id)} style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: routine.liked ? "var(--primary)" : "var(--text-muted)" }}>
                    <i className={routine.liked ? "ri-heart-3-fill" : "ri-heart-3-line"}></i>
                  </button>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5", marginBottom: "1.2rem" }}>
                  {routine.description}
                </p>
                <button 
                  onClick={() => handleStartWorkout(routine.id)}
                  style={{ width: "100%", padding: "0.8rem", background: "var(--primary)", border: "none", borderRadius: "10px", color: "white", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 10px rgba(244,63,94,0.2)" }}
                >
                  루틴 시작하기 <i className="ri-play-fill" style={{ marginLeft: "4px" }}></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <nav id="bottom-nav" className="bottom-nav">
        <Link href="/" className="nav-item" style={{ textDecoration: "none" }}>
          <i className="ri-home-smile-line"></i>
          <span>홈</span>
        </Link>
        <Link href="/routines" className="nav-item active" style={{ textDecoration: "none" }}>
          <i className="ri-file-list-3-fill"></i>
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

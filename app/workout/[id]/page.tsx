"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

const WORKOUT_DATA: Record<string, any> = {
  "1": {
    title: "스트렝스 5x5 프로그램",
    exercises: [
      { name: "스쿼트", sets: "5세트", reps: "5회", muscle: "하체/둔근", desc: "고중량 저반복으로 전체적인 힘과 부피를 키웁니다." },
      { name: "벤치 프레스", sets: "5세트", reps: "5회", muscle: "가슴/삼두", desc: "상체 미는 힘의 핵심 운동입니다." },
      { name: "바벨 로우", sets: "5세트", reps: "5회", muscle: "등/이두", desc: "두꺼운 등판을 만드는 핵심 당기기 운동입니다." }
    ]
  },
  "2": {
    title: "3분할 - 가슴/삼두 (Push)",
    exercises: [
      { name: "인클라인 덤벨 프레스", sets: "4세트", reps: "12회", muscle: "윗가슴", desc: "윗가슴 볼륨을 채워 입체적인 가슴을 만듭니다." },
      { name: "체스트 프레스 머신", sets: "4세트", reps: "15회", muscle: "대흉근", desc: "안전하게 가슴 근육에 고립하여 자극을 줍니다." },
      { name: "케이블 푸쉬다운", sets: "4세트", reps: "15회", muscle: "삼두", desc: "팔 뒷부분의 선명도를 높이는 운동입니다." }
    ]
  },
  "3": {
    title: "3분할 - 등/이두 (Pull)",
    exercises: [
      { name: "랫 풀 다운", sets: "4세트", reps: "12회", muscle: "광배근", desc: "광배근을 넓게 펼쳐 역삼각형 몸매를 만듭니다." },
      { name: "시티드 로우", sets: "4세트", reps: "12회", muscle: "중부 승모근/광배근", desc: "등의 두께감을 키워주는 운동입니다." },
      { name: "바벨 컬", sets: "3세트", reps: "12회", muscle: "이두", desc: "팔 앞쪽 근육인 이두근의 크기를 키웁니다." }
    ]
  },
  "4": {
    title: "3분할 - 하체/어깨 (Legs)",
    exercises: [
      { name: "레그 프레스", sets: "4세트", reps: "15회", muscle: "대퇴사두/둔근", desc: "하체의 전반적인 근력을 키우는 고중량 운동입니다." },
      { name: "사이드 레터럴 레이즈", sets: "4세트", reps: "20회", muscle: "측면 삼각근", desc: "어깨를 옆으로 넓게 벌려주는 핵심 운동입니다." },
      { name: "덤벨 숄더 프레스", sets: "4세트", reps: "12회", muscle: "전면/측면 삼각근", desc: "어깨 전체의 부피를 키우는 프레스 운동입니다." }
    ]
  }
};

const DINNER_RECOMMENDATIONS = [
  "오운완 ㅊㅊ! 오늘 저녁은 무조건 [수비드 닭가슴살 볶음밥]입니다. 근손실 방어하세요! 🍚",
  "크으~ 자극 지렸다! 보상으로 [육회 비빔밥] 어떠신가요? 단백질 폭탄 투하! 🥩",
  "고생하셨습니다! 근성장의 핵심은 휴식과 [안심 스테이크]입니다. 오늘 칼질 한 번? 🍽️",
  "오늘 하체하신 거 아니죠? 계단 조심하시고 저녁은 [연어 샐러드] 추천합니다. 오메가3 보충! 🐟",
  "멋집니다! 오늘 같은 날은 [구운 계란 5개]와 고구마가 정석이죠. 장인의 식단! 🥚"
];

export default function WorkoutSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const workoutId = params.id as string;
  const workout = WORKOUT_DATA[workoutId] || WORKOUT_DATA["1"];

  const [checked, setChecked] = useState<boolean[]>(new Array(workout.exercises.length).fill(false));
  const [showCardio, setShowCardio] = useState(false);
  const [showDinner, setShowDinner] = useState(false);
  const [dinnerMsg, setDinnerMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const allChecked = checked.every(v => v);

  const toggleCheck = (index: number) => {
    const newChecked = [...checked];
    newChecked[index] = !newChecked[index];
    setChecked(newChecked);
  };

  const handleFinishStrength = () => {
    setShowCardio(true);
  };

  const handleFinishAll = async () => {
    setLoading(true);
    const randomDinner = DINNER_RECOMMENDATIONS[Math.floor(Math.random() * DINNER_RECOMMENDATIONS.length)];
    setDinnerMsg(randomDinner);
    
    try {
      await fetch("/api/workout-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routineName: workout.title,
          durationMins: 60 // Dummy duration
        })
      });
      setShowDinner(true);
    } catch (error) {
      console.error("Failed to save log", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="app">
      <main className="view" style={{ paddingBottom: "2rem" }}>
        <header className="dashboard-header" style={{ padding: "1.5rem 1rem", borderBottom: "1px solid var(--border-soft)" }}>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.2rem", cursor: "pointer" }}>
            <i className="ri-arrow-left-line"></i>
          </button>
          <div style={{ flex: 1, textAlign: "center", marginRight: "1.2rem" }}>
            <h2 style={{ fontSize: "1.2rem" }}>{workout.title}</h2>
          </div>
        </header>

        <div style={{ padding: "1rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", color: "var(--primary)", marginBottom: "0.5rem" }}>진행 상황 ({checked.filter(v=>v).length}/{workout.exercises.length})</h3>
            <div style={{ width: "100%", height: "8px", background: "var(--bg-card)", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ width: `${(checked.filter(v=>v).length / workout.exercises.length) * 100}%`, height: "100%", background: "var(--primary)", transition: "width 0.3s" }}></div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {workout.exercises.map((ex: any, idx: number) => (
              <div key={idx} className="glass-card" style={{ padding: "1.2rem", border: checked[idx] ? "1px solid var(--primary)" : "1px solid var(--border-soft)", opacity: checked[idx] ? 0.7 : 1, transition: "all 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: "1.1rem", marginBottom: "0.3rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {ex.name}
                      <span style={{ fontSize: "0.75rem", color: "var(--success)", background: "rgba(16,185,129,0.1)", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>{ex.muscle}</span>
                    </h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600", marginBottom: "0.5rem" }}>{ex.sets} x {ex.reps}</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: "1.4" }}>{ex.desc}</p>
                  </div>
                  <button 
                    onClick={() => toggleCheck(idx)}
                    style={{ 
                      width: "32px", height: "32px", borderRadius: "50%", 
                      border: "2px solid var(--primary)", 
                      background: checked[idx] ? "var(--primary)" : "transparent",
                      color: checked[idx] ? "white" : "var(--primary)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", fontSize: "1.2rem"
                    }}
                  >
                    {checked[idx] && <i className="ri-check-line"></i>}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {allChecked && !showCardio && (
            <button 
              onClick={handleFinishStrength}
              style={{ width: "100%", marginTop: "2rem", padding: "1rem", background: "var(--primary)", border: "none", borderRadius: "12px", color: "white", fontWeight: "700", fontSize: "1.1rem", cursor: "pointer", animation: "pulse 2s infinite" }}
            >
              근력 운동 완료!
            </button>
          )}

          {showCardio && !showDinner && (
            <div className="glass-card" style={{ marginTop: "2rem", padding: "1.5rem", border: "2px solid var(--success)", textAlign: "center" }}>
              <h3 style={{ color: "var(--success)", marginBottom: "0.8rem" }}>🏃‍♂️ 유산소 권장!</h3>
              <p style={{ fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
                체력을 기르기 위해 유산소는 필수인 거 아시죠? <br/>
                <strong>런닝머신이나 사이클 15분</strong>만 더 하고 <br/>
                오늘의 운동을 완벽하게 마무리합시다!
              </p>
              <button 
                onClick={handleFinishAll}
                disabled={loading}
                style={{ width: "100%", padding: "1rem", background: "var(--success)", border: "none", borderRadius: "10px", color: "white", fontWeight: "700", cursor: "pointer" }}
              >
                {loading ? "기록 중..." : "유산소까지 완료! (오운완)"}
              </button>
            </div>
          )}

          {showDinner && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", zIndex: 1000, backdropFilter: "blur(5px)" }}>
              <div className="glass-card" style={{ background: "#1e1e1e", padding: "2.5rem 2rem", textAlign: "center", maxWidth: "400px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
                <div style={{ fontSize: "4.5rem", marginBottom: "1.5rem", animation: "bounce 2s infinite" }}>🏆</div>
                <h2 style={{ marginBottom: "1.2rem", color: "#ffffff", fontSize: "1.5rem", fontWeight: "800" }}>오늘 운동 고생하셨어요!</h2>
                <div style={{ background: "rgba(244,63,94,0.15)", padding: "1.5rem", borderRadius: "16px", border: "1px dashed var(--primary)", marginBottom: "2rem" }}>
                  <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "#ffffff", fontWeight: "600" }}>
                    {dinnerMsg}
                  </p>
                </div>
                <button 
                  onClick={() => router.push("/history")}
                  style={{ width: "100%", padding: "1rem", background: "var(--primary)", border: "none", borderRadius: "12px", color: "white", fontWeight: "700", cursor: "pointer" }}
                >
                  기록 확인하러 가기
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useState } from "react";

export function DashboardView({ user }: { user: any }) {
  const [foodLogs, setFoodLogs] = useState<{ id: string; name: string; calories: number }[]>([]);
  const [foodName, setFoodName] = useState("");
  const [foodCalories, setFoodCalories] = useState("");
  const [exerciseCalories, setExerciseCalories] = useState("");
  const [dailyExercise, setDailyExercise] = useState(0);

  const dailyTarget = 2000;
  const totalConsumed = foodLogs.reduce((sum, item) => sum + item.calories, 0);
  const caloriesRemaining = dailyTarget - totalConsumed;

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !foodCalories) return;
    
    const newLog = {
      id: Date.now().toString(),
      name: foodName,
      calories: parseInt(foodCalories, 10),
    };
    
    setFoodLogs([...foodLogs, newLog]);
    setFoodName("");
    setFoodCalories("");
  };

  const handleExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseCalories) return;
    setDailyExercise(parseInt(exerciseCalories, 10));
    setExerciseCalories("");
  };

  const handleDeleteFood = (id: string) => {
    setFoodLogs(foodLogs.filter((log) => log.id !== id));
  };

  // SVG Progress calculation
  const radius = 88;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(totalConsumed / dailyTarget, 1);
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="dashboard-grid" style={{ marginTop: "1rem" }}>
      {/* Progress Circular Widget */}
      <div className="glass-card main-progress-card" style={{ position: "relative" }}>
        <div className="d-day-badge" id="d-day-badge">
          D-<span id="days-remaining">14</span>
        </div>

        <div className="progress-container">
          <svg className="progress-ring" width="200" height="200">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>
            </defs>
            <circle
              className="progress-ring__circle-bg"
              strokeWidth="12"
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
            ></circle>
            <circle
              className="progress-ring__circle"
              strokeWidth="12"
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              style={{ strokeDasharray: circumference, strokeDashoffset }}
            ></circle>
          </svg>
          <div className="progress-text">
            <div className="consumed">{totalConsumed}</div>
            <div className="divider"></div>
            <div className="target">/ {dailyTarget} kcal</div>
          </div>
        </div>
        <div className="calorie-summary">
          <div className="stat-item">
            <span className="label">남은 칼로리</span>
            <span className={`value ${caloriesRemaining < 0 ? "text-red" : "accent"}`}>
              {caloriesRemaining}
            </span>
          </div>
          <div className="sub-stats">
            <div className="sub-stat-item">
              <span className="label">오늘 운동 소비량</span>
              <div>
                <span className="value" style={{ color: "var(--success)" }}>
                  {dailyExercise}
                </span>{" "}
                kcal
              </div>
            </div>
            <div className="sub-stat-item">
              <span className="label">오늘의 최종 적자</span>
              <div>
                <span className="value highlight">
                  {(2000 + dailyExercise) - totalConsumed}
                </span>{" "}
                kcal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="info-cards">
        <div className="glass-card stat-card">
          <div className="icon-wrapper orange">
            <i className="ri-scales-3-fill"></i>
          </div>
          <div className="stat-content">
            <span className="label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>체중 (목표 <span style={{ color: "var(--primary)", fontWeight: "600" }}>60.0</span>kg)</span>
            </span>
            <form style={{ display: "flex", alignItems: "center", gap: "0.2rem", marginTop: "0.2rem" }}>
              <input
                type="number"
                step="0.1"
                required
                defaultValue={65.5}
                style={{
                  width: "75px",
                  padding: "0.2rem",
                  fontSize: "1.4rem",
                  fontWeight: "700",
                  border: "none",
                  borderBottom: "2px solid var(--primary)",
                  borderRadius: "0",
                  background: "transparent",
                  color: "var(--text-main)",
                }}
              />
              <span className="unit" style={{ fontSize: "1.1rem", fontWeight: "600" }}>kg</span>
              <button type="button" className="btn-icon" style={{ marginLeft: "auto", color: "var(--primary)", fontSize: "1.3rem" }}>
                <i className="ri-save-fill"></i>
              </button>
            </form>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="icon-wrapper green">
            <i className="ri-body-scan-fill"></i>
          </div>
          <div className="stat-content">
            <span className="label">내 기본 유지 칼로리</span>
            <div className="row">
              <span className="value">2,100</span> <span className="unit">kcal</span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>(BMR × 1.2)</span>
          </div>
        </div>
        <div className="glass-card stat-card" style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center" }}>
          <div className="icon-wrapper pink">
            <i className="ri-drop-fill"></i>
          </div>
          <div className="stat-content" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <span className="label">🔥 누적 적자량</span>
            <div className="row" style={{ textAlign: "right" }}>
              <span className="value" style={{ fontSize: "1.1rem" }}>4,500</span> <span className="unit">kcal</span>
              <span style={{ margin: "0 0.5rem", color: "var(--text-muted)" }}>≈</span>
              <span className="value" style={{ color: "var(--primary)" }}>0.58</span> <span className="unit">kg 감량!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Logger */}
      <div className="glass-card logger-card mt-6">
        <h3 style={{ color: "var(--success)" }}>
          <i className="ri-run-line"></i> 활동 칼로리
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.5rem 0 1rem 0" }}>
          스마트워치 및 건강 앱에 기록된 오늘의 <strong>활동 칼로리(기초대사량 제외)</strong> 수치를 입력해 주세요!
        </p>
        <form onSubmit={handleExerciseSubmit} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="number"
            placeholder="예: 450"
            required
            min="0"
            value={exerciseCalories}
            onChange={(e) => setExerciseCalories(e.target.value)}
            style={{
              flex: "1",
              padding: "0.8rem",
              borderRadius: "12px",
              border: "1px solid var(--border-soft)",
              fontSize: "1rem",
              color: "var(--text-main)",
            }}
          />
          <button
            type="submit"
            className="btn-primary-small"
            style={{ background: "var(--success)", whiteSpace: "nowrap", height: "auto", padding: "0.8rem 1.2rem", fontSize: "1rem" }}
          >
            <i className="ri-check-line"></i> 확인
          </button>
        </form>
      </div>

      {/* Food Logger */}
      <div className="glass-card logger-card mt-6">
        <h3 style={{ color: "var(--primary)" }}>
          <i className="ri-restaurant-2-line"></i> 식단
        </h3>
        <form onSubmit={handleAddFood} className="food-form">
          <input
            type="text"
            placeholder="무엇을 드셨나요? (예: 바나나)"
            required
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
          />
          <input
            type="number"
            placeholder="섭취 (kcal)"
            required
            min="1"
            value={foodCalories}
            onChange={(e) => setFoodCalories(e.target.value)}
          />
          <button type="submit" className="btn-primary-small">
            <i className="ri-add-line"></i> 추가
          </button>
        </form>
        <div className="food-list-container">
          <ul className="food-list">
            {foodLogs.map((log) => (
              <li key={log.id}>
                <div className="food-info">
                  <span className="food-name">{log.name}</span>
                  <span className="food-cal">{log.calories} kcal</span>
                </div>
                <button
                  type="button"
                  className="fd-delete-btn delete-btn"
                  onClick={() => handleDeleteFood(log.id)}
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </li>
            ))}
          </ul>
          {foodLogs.length === 0 && (
            <div className="empty-state" style={{ display: "flex" }}>
              <i className="ri-restaurant-2-line"></i>
              <p>아직 기록된 음식이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

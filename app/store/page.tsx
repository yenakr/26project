"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function StorePage() {
  const { data: session } = useSession();
  
  // Dummy data for products
  const [products, setProducts] = useState([
    { id: "1", name: "머슬메이트 WPI 프로틴 2kg", description: "유당불내증 걱정 없는 순수 분리유청단백질 (초코맛)", price: 65000, proteinContent: 25, liked: true },
    { id: "2", name: "수비드 닭가슴살 10팩 (갈릭맛)", description: "촉촉하고 부드러운 수비드 공법으로 만든 닭가슴살", price: 18000, proteinContent: 23, liked: false },
    { id: "3", name: "프로틴 단백질 바 (12개입)", description: "간편하게 즐기는 고단백 간식, 견과류 듬뿍", price: 24000, proteinContent: 15, liked: false },
    { id: "4", name: "크레아틴 모노하이드레이트 300g", description: "근력 향상과 폭발적인 에너지 부스팅", price: 22000, proteinContent: 0, liked: false }
  ]);

  const [toastMsg, setToastMsg] = useState("");

  const toggleLike = (id: string) => {
    setProducts(products.map(p => p.id === id ? { ...p, liked: !p.liked } : p));
    // TODO: Connect to Prisma API
  };

  const handlePurchase = (name: string, price: number) => {
    setToastMsg(`"${name}" 장바구니에 담김!`);
    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <div id="app">
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{ position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", background: "var(--text-main)", color: "var(--bg-main)", padding: "1rem 2rem", borderRadius: "30px", fontWeight: "600", zIndex: 9999, boxShadow: "0 10px 25px rgba(0,0,0,0.2)", animation: "fadeInDown 0.3s ease-out", whiteSpace: "nowrap" }}>
          {toastMsg}
        </div>
      )}
      <main className="view" style={{ paddingBottom: "5rem" }}>
        <header className="dashboard-header" style={{ justifyContent: "center" }}>
          <h2>🛒 근성장 스토어</h2>
        </header>

        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <p className="subtitle" style={{ margin: 0 }}>검증된 영양을 채워보세요.</p>
            <button style={{ background: "none", border: "none", color: "var(--text-main)", fontSize: "1.2rem", cursor: "pointer" }}>
              <i className="ri-shopping-cart-line"></i>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "1rem" }}>
            {products.map((product) => (
              <div key={product.id} style={{ background: "var(--bg-main)", borderRadius: "12px", padding: "1rem", border: "1px solid var(--border-soft)", position: "relative", display: "flex", flexDirection: "column" }}>
                <button onClick={() => toggleLike(product.id)} style={{ position: "absolute", top: "0.5rem", right: "0.5rem", background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", color: product.liked ? "var(--primary)" : "var(--text-muted)", transition: "transform 0.2s" }}>
                  <i className={product.liked ? "ri-heart-3-fill" : "ri-heart-3-line"}></i>
                </button>
                
                <div style={{ height: "100px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                  [이미지 없음]
                </div>
                
                <span style={{ fontSize: "0.75rem", background: "rgba(16,185,129,0.1)", color: "var(--success)", padding: "0.2rem 0.5rem", borderRadius: "10px", fontWeight: "700", alignSelf: "flex-start", marginBottom: "0.5rem" }}>
                  단백질 {product.proteinContent}g
                </span>
                
                <h3 style={{ fontSize: "0.95rem", color: "var(--text-main)", marginBottom: "0.5rem", flex: 1 }}>{product.name}</h3>
                <p style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--primary)", marginBottom: "1rem" }}>
                  ₩{product.price.toLocaleString()}
                </p>
                
                <button 
                  onClick={() => handlePurchase(product.name, product.price)}
                  style={{ width: "100%", padding: "0.6rem", background: "var(--text-main)", border: "none", borderRadius: "8px", color: "var(--bg-main)", fontWeight: "600", cursor: "pointer", fontSize: "0.85rem" }}
                >
                  장바구니 담기
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
        <Link href="/routines" className="nav-item" style={{ textDecoration: "none" }}>
          <i className="ri-file-list-3-line"></i>
          <span>루틴</span>
        </Link>
        <Link href="/history" className="nav-item" style={{ textDecoration: "none" }}>
          <i className="ri-calendar-check-line"></i>
          <span>기록</span>
        </Link>
        <Link href="/store" className="nav-item active" style={{ textDecoration: "none" }}>
          <i className="ri-shopping-bag-3-fill"></i>
          <span>스토어</span>
        </Link>
      </nav>
    </div>
  );
}

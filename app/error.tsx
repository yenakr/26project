"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error("Runtime Exception:", error);
  }, [error]);

  return (
    <div className="container" style={{ maxWidth: '600px', marginTop: '20vh', textAlign: 'center' }}>
      <div className="card shadow-lg p-12 border-top" style={{ borderTopColor: 'var(--red-primary)' }}>
        <i className="ri-error-warning-fill text-red-primary" style={{ fontSize: '4rem' }}></i>
        <h2 className="section-title justify-center mt-4 mb-2">화면을 불러오는 중 문제가 발생했습니다.</h2>
        <p className="text-gray mb-8">
          입력하신 내용은 가능한 한 유지되도록 설계되었습니다. <br />
          아래 버튼을 눌러 다시 시도해 주세요.
        </p>
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => reset()} 
            className="btn btn-primary w-full py-4"
            style={{ fontSize: '1.1rem' }}
          >
            <i className="ri-refresh-line mr-2"></i> 다시 시도하기
          </button>
          <button 
            onClick={() => window.location.href = '/'} 
            className="btn"
            style={{ background: '#f1f5f9', color: '#475569' }}
          >
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}

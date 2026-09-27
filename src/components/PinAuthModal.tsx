import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound } from 'lucide-react';

interface PinAuthModalProps {
  onSuccess: () => void;
}

export function PinAuthModal({ onSuccess }: PinAuthModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '0214') {
      sessionStorage.setItem('crew_auth_pin', 'true');
      onSuccess();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-100 text-center animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          이런저런 🏃‍♂️🏃‍♀️ 출석관리
        </h2>
        <p className="text-sm text-gray-5 Mach text-gray-500 mb-6">
          개인정보 보호를 위해 접근 비밀번호(PIN)를 입력해주세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setError(false);
                setPin(e.target.value);
              }}
              placeholder="비밀번호 4자리"
              className={`w-full pl-11 pr-4 py-3 text-center text-xl font-bold tracking-widest border rounded-xl focus:ring-2 outline-none transition ${
                error
                  ? 'border-rose-400 ring-rose-200 bg-rose-50/30'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }`}
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-600 animate-shake">
              <ShieldAlert className="w-4 h-4" />
              <span>비밀번호가 올바르지 않습니다. 다시 입력해 주세요.</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition duration-150"
          >
            대시보드 진입
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
          🔒 100% 브라우저 메모리 보안 처리 (데이터 외부 미전송)
        </div>
      </div>
    </div>
  );
}

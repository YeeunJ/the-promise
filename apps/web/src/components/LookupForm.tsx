import { useState } from 'react';
import { normalizePhone } from '../utils/formatPhone';

interface LookupFormProps {
  onSubmit: (credentials: { name: string; phone: string }) => void;
  isLoading?: boolean;
}

function LookupForm({ onSubmit, isLoading = false }: LookupFormProps): JSX.Element {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhone(normalizePhone(e.target.value));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    if (!phone.trim()) {
      setError('연락처를 입력해주세요.');
      return;
    }

    onSubmit({ name: name.trim(), phone: phone.trim() });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900">내 예약 조회</h2>
        <p className="text-sm text-gray-500 mt-1">예약 시 입력하신 이름과 연락처를 입력해주세요.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="lookup-name"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            이름
          </label>
          <input
            id="lookup-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="신청자 이름"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="lookup-phone"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            연락처
          </label>
          <input
            id="lookup-phone"
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="010-0000-0000"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-colors"
          />
        </div>

        {error !== null && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-primary text-white font-bold text-base rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
        >
          {isLoading ? '조회 중...' : '예약 조회'}
        </button>
      </form>
    </div>
  );
}

export default LookupForm;

import { useState } from 'react';
import axios from 'axios';
import { normalizePhone } from '../utils/formatPhone';
import type { Reservation } from '../types/index';

interface LookupFormProps {
  onResult: (reservations: Reservation[]) => void;
}

function LookupForm({ onResult }: LookupFormProps): JSX.Element {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhone(normalizePhone(e.target.value));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

    setIsLoading(true);
    try {
      const response = await axios.get<Reservation[]>(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/reservations/`,
        { params: { name: name.trim(), phone: phone.trim() } }
      );
      onResult(response.data);
    } catch {
      setError('조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="lookup-name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          이름
        </label>
        <input
          id="lookup-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="신청자 이름"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="lookup-phone"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          연락처
        </label>
        <input
          id="lookup-phone"
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="010-0000-0000"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {error !== null && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? '조회 중...' : '예약 조회'}
      </button>
    </form>
  );
}

export default LookupForm;

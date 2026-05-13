import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clipboard, Search, User, Phone, Info } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { normalizePhone } from '../utils/formatPhone';
import { useLookupCredentials } from '../hooks/useLookupCredentials';

function LookupLoginPage(): JSX.Element {
  const navigate = useNavigate();
  const { setCredentials } = useLookupCredentials();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError('이름을 입력해주세요.');
      return;
    }
    if (!trimmedPhone) {
      setError('연락처를 입력해주세요.');
      return;
    }

    setCredentials({ name: trimmedName, phone: trimmedPhone });
    navigate('/my');
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-10">
      <div className="relative w-full max-w-[440px]">
        <div
          className="absolute -inset-3 bg-primary-100 rounded-[24px] rotate-[-1.5deg]"
          aria-hidden="true"
        />
        <form
          onSubmit={handleSubmit}
          className="relative bg-surface rounded-[20px] p-8 shadow-design-lg border border-edge-soft"
          noValidate
        >
          <div className="flex flex-col items-center text-center mb-7">
            <div
              className="w-12 h-12 rounded-full bg-primary-100 grid place-items-center text-primary mb-3"
              aria-hidden="true"
            >
              <Clipboard size={22} strokeWidth={1.8} />
            </div>
            <h1 className="text-[22px] font-extrabold tracking-[-0.025em] text-ink m-0">
              내 예약 조회
            </h1>
            <p className="text-[13px] text-ink-soft mt-1.5 leading-[1.5]">
              예약 신청 시 입력한 이름과 연락처로 조회합니다.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Input
              label="이름"
              required
              autoComplete="name"
              placeholder="신청자 이름"
              value={name}
              onChange={(e) => { setName(e.target.value); }}
              iconLeft={<User size={16} className="text-ink-mute" />}
            />
            <Input
              label="연락처"
              required
              type="tel"
              autoComplete="tel"
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => { setPhone(normalizePhone(e.target.value)); }}
              iconLeft={<Phone size={16} className="text-ink-mute" />}
            />
          </div>

          {error !== null && (
            <p role="alert" className="text-[12px] text-danger mt-3">
              {error}
            </p>
          )}

          <div className="mt-6">
            <Button
              type="submit"
              variant="primary"
              iconLeft={<Search size={16} />}
              className="w-full"
            >
              예약 조회하기
            </Button>
          </div>

          <div className="mt-5 flex items-start gap-2 p-3 rounded-[12px] bg-surface-2 text-[11px] text-ink-soft leading-[1.5]">
            <Info size={14} className="text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              예약 시 신청한 이름과 휴대폰 번호로 조회할 수 있어요.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LookupLoginPage;

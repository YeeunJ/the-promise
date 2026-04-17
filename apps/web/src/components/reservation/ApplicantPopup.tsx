import { useState, useRef, useEffect } from 'react';
import { normalizePhone } from '../../utils/formatPhone';
import { PHONE_REGEX } from '../../utils/reservationFormHelpers';
import StepPopup from './StepPopup';
import type { CompletedStep } from '../../utils/buildCompletedSteps';
import DepartmentSelector from './DepartmentSelector';
import type { DepartmentSelection } from './DepartmentSelector';

export interface ApplicantData {
  name: string;
  phone: string;
  departmentId: number;
  departmentName: string;
  teamId: number | null;
  teamName: string;
  customTeamName: string | null;
  pastorDisplay: string;
}

interface ApplicantPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  onReset?: () => void;
  value: ApplicantData | null;
  onConfirm: (data: ApplicantData) => void;
  completedSteps?: CompletedStep[];
}

type InternalStep = 'name' | 'phone' | 'team';

function toDepartmentSelection(data: ApplicantData): DepartmentSelection {
  return {
    departmentId: data.departmentId,
    departmentName: data.departmentName,
    teamId: data.teamId,
    teamName: data.teamName,
    customTeamName: data.customTeamName,
    pastorDisplay: data.pastorDisplay,
  };
}

function ApplicantPopup({ isOpen, onClose, onBack, onReset, value, onConfirm, completedSteps }: ApplicantPopupProps): JSX.Element {
  const [step, setStep] = useState<InternalStep>('name');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState<DepartmentSelection | null>(null);
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (focusTimerRef.current !== null) clearTimeout(focusTimerRef.current); };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setName(value?.name ?? '');
      setPhone(value?.phone ?? '');
      setDepartment(
        value ? toDepartmentSelection(value) : null,
      );
      // 항상 name부터 시작 — 재편집 시에도 순차 진행
      setStep('name');
      setNameError('');
      setPhoneError('');
      if (focusTimerRef.current !== null) clearTimeout(focusTimerRef.current);
      focusTimerRef.current = setTimeout(() => nameRef.current?.focus(), 350);
    }
    // Intentional: only re-initialize on popup open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (step === 'phone') {
      if (focusTimerRef.current !== null) clearTimeout(focusTimerRef.current);
      focusTimerRef.current = setTimeout(() => phoneRef.current?.focus(), 200);
    }
  }, [step]);

  // --- step: name ---
  function handleNameNext() {
    if (!name.trim()) { setNameError('이름을 입력해주세요'); return; }
    setNameError('');
    setStep('phone');
  }

  // --- step: phone ---
  function handlePhoneNext() {
    if (!phone.trim()) { setPhoneError('연락처를 입력해주세요'); return; }
    if (!PHONE_REGEX.test(phone)) { setPhoneError('010-XXXX-XXXX 형식으로 입력해주세요'); return; }
    setPhoneError('');
    setStep('team');
  }

  // --- step: team ---
  function handleTeamConfirm() {
    if (!department) return;
    const isEtc = department.departmentName === '기타';
    if (!isEtc && !department.teamId) return;
    if (isEtc && !department.customTeamName?.trim()) return;
    onConfirm({
      name: name.trim(),
      phone,
      departmentId: department.departmentId,
      departmentName: department.departmentName,
      teamId: department.teamId,
      teamName: department.teamName,
      customTeamName: department.customTeamName,
      pastorDisplay: department.pastorDisplay,
    });
  }

  function handleInternalBack() {
    if (step === 'phone') { setStep('name'); return; }
    if (step === 'team') { setStep('phone'); return; }
    onBack?.();
  }

  function handleKeyDown(next: () => void) {
    return (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') { e.preventDefault(); next(); }
    };
  }

  const subtitleMap: Record<InternalStep, string> = { name: '1/3', phone: '2/3', team: '3/3' };

  const localCompletedSteps: CompletedStep[] = [];
  if (step !== 'name') {
    localCompletedSteps.push({ label: '이름', value: name });
  }
  if (step === 'team') {
    localCompletedSteps.push({ label: '연락처', value: phone });
  }

  return (
    <StepPopup
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      title="신청자 정보"
      subtitle={subtitleMap[step]}
      onBack={step === 'name' ? onBack : handleInternalBack}
      onConfirm={
        step === 'name' ? handleNameNext
        : step === 'phone' ? handlePhoneNext
        : handleTeamConfirm
      }
      canConfirm={
        step === 'name' ? name.trim() !== ''
        : step === 'phone' ? phone.trim() !== ''
        : department?.departmentName === '기타'
          ? Boolean(department?.customTeamName?.trim())
          : Boolean(department?.teamId)
      }
      confirmLabel="다음"
      completedSteps={[...(completedSteps ?? []), ...localCompletedSteps]}
    >
      {/* step: name */}
      {step === 'name' && (
        <div>
          <p className="text-base font-semibold text-black mb-4">신청자 이름을 입력해주세요</p>
          <input
            ref={nameRef}
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError(''); }}
            onKeyDown={handleKeyDown(handleNameNext)}
            placeholder="홍길동"
            className={`w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary ${
              nameError ? 'border-[#DC2626] bg-[#DC2626]/5' : 'border-gray-300 bg-white'
            }`}
          />
          {nameError && <p className="mt-1 text-xs text-[#DC2626]">{nameError}</p>}
        </div>
      )}

      {/* step: phone */}
      {step === 'phone' && (
        <div>
          <p className="text-base font-semibold text-black mb-4">연락처를 입력해주세요</p>
          <input
            ref={phoneRef}
            type="text"
            inputMode="numeric"
            value={phone}
            onChange={(e) => { setPhone(normalizePhone(e.target.value)); setPhoneError(''); }}
            onKeyDown={handleKeyDown(handlePhoneNext)}
            placeholder="010-0000-0000"
            className={`w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary ${
              phoneError ? 'border-[#DC2626] bg-[#DC2626]/5' : 'border-gray-300 bg-white'
            }`}
          />
          {phoneError && <p className="mt-1 text-xs text-[#DC2626]">{phoneError}</p>}
        </div>
      )}

      {/* step: team */}
      {step === 'team' && (
        <div>
          <p className="text-base font-semibold text-black mb-4">단체를 선택해주세요</p>
          <DepartmentSelector value={department} onChange={setDepartment} />
        </div>
      )}
    </StepPopup>
  );
}

export default ApplicantPopup;

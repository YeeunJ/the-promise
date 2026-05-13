import { useEffect, useRef, useState } from 'react';
import { Check, Phone } from 'lucide-react';
import type { ApplicantData } from '../../../types/booking';
import { normalizePhone } from '../../../utils/formatPhone';
import { PHONE_REGEX } from '../../../utils/reservationFormHelpers';
import DepartmentSelector from '../../reservation/DepartmentSelector';
import type { DepartmentSelection } from '../../reservation/DepartmentSelector';

interface ApplicantStepProps {
  value: ApplicantData | null;
  onChange: (data: ApplicantData) => void;
}

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

function isDepartmentValid(department: DepartmentSelection | null): boolean {
  if (!department) return false;
  if (department.departmentName === '기타') {
    return Boolean(department.customTeamName?.trim());
  }
  return Boolean(department.teamId);
}

function buildApplicantData(
  name: string,
  phone: string,
  department: DepartmentSelection | null,
): ApplicantData | null {
  if (!name.trim() || !PHONE_REGEX.test(phone) || !isDepartmentValid(department)) {
    return null;
  }
  return {
    name: name.trim(),
    phone,
    departmentId: department!.departmentId,
    departmentName: department!.departmentName,
    teamId: department!.teamId,
    teamName: department!.teamName,
    customTeamName: department!.customTeamName,
    pastorDisplay: department!.pastorDisplay,
  };
}

export function ApplicantStep({ value, onChange }: ApplicantStepProps): JSX.Element {
  const [name, setName] = useState<string>(value?.name ?? '');
  const [phone, setPhone] = useState<string>(value?.phone ?? '010-');
  const [department, setDepartment] = useState<DepartmentSelection | null>(
    value ? toDepartmentSelection(value) : null,
  );

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  function emitIfValid(n: string, p: string, d: DepartmentSelection | null): void {
    const data = buildApplicantData(n, p, d);
    if (data) onChangeRef.current(data);
  }

  function handleNameChange(v: string): void {
    setName(v);
    emitIfValid(v, phone, department);
  }

  function handlePhoneChange(raw: string): void {
    const normalized = normalizePhone(raw);
    const next = normalized.startsWith('010') ? normalized : '010-';
    setPhone(next);
    emitIfValid(name, next, department);
  }

  function handleDepartmentChange(next: DepartmentSelection): void {
    setDepartment(next);
    emitIfValid(name, phone, next);
  }

  // Hydrate when value changes from outside (e.g. draft restore on revisit)
  useEffect(() => {
    if (value === null) return;
    setName(value.name);
    setPhone(value.phone);
    setDepartment(toDepartmentSelection(value));
  }, [value]);

  const isNameValid = name.trim().length > 0;
  const isPhoneValid = PHONE_REGEX.test(phone);

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {/* 좌: 기본 정보 */}
      <section className="rounded-[18px] border border-edge-soft bg-surface p-6">
        <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em] text-accent">
          기본 정보
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-ink">이름</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="홍길동"
              className={
                'w-full rounded-[14px] border px-4 py-3 pr-10 text-[15px] ' +
                'bg-surface text-ink placeholder:text-ink-mute ' +
                'focus:outline-none focus:ring-2 focus:ring-primary/20 ' +
                (isNameValid
                  ? 'border-primary/40 focus:border-primary'
                  : 'border-edge focus:border-primary')
              }
            />
            {isNameValid && (
              <Check
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary"
                aria-hidden="true"
              />
            )}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">연락처</label>
          <div className="relative">
            <Phone
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"
              aria-hidden="true"
            />
            <input
              type="text"
              inputMode="numeric"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="010-0000-0000"
              className={
                'w-full rounded-[14px] border bg-surface py-3 pl-9 pr-4 text-[15px] ' +
                'text-ink placeholder:text-ink-mute ' +
                'focus:outline-none focus:ring-2 focus:ring-primary/20 ' +
                (isPhoneValid
                  ? 'border-primary/40 focus:border-primary'
                  : 'border-edge focus:border-primary')
              }
            />
          </div>
        </div>
      </section>

      {/* 우: 단체 */}
      <section className="rounded-[18px] border border-edge-soft bg-surface p-6">
        <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em] text-accent">
          단체
        </div>
        <DepartmentSelector value={department} onChange={handleDepartmentChange} />
      </section>
    </div>
  );
}

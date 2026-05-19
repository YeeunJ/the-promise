import { useCallback, useEffect, useState } from 'react';
import type {
  AdminTeam,
  AdminTeamWritePayload,
  ApiDepartment,
  ApiPastor,
} from '../../../types';

interface TeamFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  entity: AdminTeam | null;
  departments: ApiDepartment[];
  pastors: ApiPastor[];
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (payload: AdminTeamWritePayload) => Promise<void>;
  onClose: () => void;
}

interface FormState {
  name: string;
  departmentId: string;
  pastorId: string;
  leaderPhone: string;
}

function initialFromEntity(entity: AdminTeam | null): FormState {
  if (entity === null) {
    return { name: '', departmentId: '', pastorId: '', leaderPhone: '' };
  }
  return {
    name: entity.name,
    departmentId:
      entity.department === null ? '' : String(entity.department.id),
    pastorId: entity.pastor === null ? '' : String(entity.pastor.id),
    leaderPhone: entity.leader_phone,
  };
}

export function TeamFormModal({
  isOpen,
  mode,
  entity,
  departments,
  pastors,
  isSubmitting,
  errorMessage,
  onSubmit,
  onClose,
}: TeamFormModalProps): JSX.Element | null {
  const [form, setForm] = useState<FormState>(() => initialFromEntity(entity));

  // 모달 open 시점에 entity 기반으로 form 초기화
  useEffect(() => {
    if (isOpen) {
      setForm(initialFromEntity(entity));
    }
  }, [isOpen, entity]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    },
    [onClose, isSubmitting],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const trimmedName = form.name.trim();
  const trimmedPhone = form.leaderPhone.trim();
  const isValid =
    trimmedName.length > 0 &&
    form.departmentId.length > 0 &&
    trimmedPhone.length > 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!isValid || isSubmitting) return;
    const payload: AdminTeamWritePayload = {
      name: trimmedName,
      department: Number(form.departmentId),
      pastor: form.pastorId !== '' ? Number(form.pastorId) : null,
      leader_phone: trimmedPhone,
    };
    await onSubmit(payload);
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>): void {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  }

  return (
    <div
      data-testid="team-form-overlay"
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-form-title"
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="bg-white rounded-xl shadow-md border border-[#E5E7EB] max-w-md w-full mx-4 p-6"
      >
        <h3
          id="team-form-title"
          className="text-lg font-bold text-black mb-4"
        >
          {mode === 'create' ? '팀 추가' : '팀 수정'}
        </h3>

        {errorMessage !== null && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 mb-4"
          >
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="team-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              팀명 <span className="text-red-500">*</span>
            </label>
            <input
              id="team-name"
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={isSubmitting}
              required
              className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
            />
          </div>

          <div>
            <label
              htmlFor="team-department"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              부서 <span className="text-red-500">*</span>
            </label>
            <select
              id="team-department"
              value={form.departmentId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, departmentId: e.target.value }))
              }
              disabled={isSubmitting}
              required
              className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
            >
              <option value="">선택하세요</option>
              {departments.map((dept) => (
                <option key={dept.id} value={String(dept.id)}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {pastors.length > 0 && (
            <div>
              <label
                htmlFor="team-pastor"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                담당교역자
              </label>
              <select
                id="team-pastor"
                value={form.pastorId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, pastorId: e.target.value }))
                }
                disabled={isSubmitting}
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
              >
                <option value="">없음</option>
                {pastors.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name} {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label
              htmlFor="team-phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              id="team-phone"
              type="tel"
              value={form.leaderPhone}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, leaderPhone: e.target.value }))
              }
              disabled={isSubmitting}
              required
              placeholder="010-1234-5678"
              className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-gray-50"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-2 border-[#E5E7EB] rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            닫기
          </button>
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="bg-primary text-white rounded-xl px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '저장 중...' : mode === 'create' ? '추가' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}

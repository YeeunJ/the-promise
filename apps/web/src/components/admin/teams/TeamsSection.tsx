import { useMemo, useState } from 'react';
import type { AdminTeam, AdminTeamWritePayload } from '../../../types';
import { useAdminTeams } from '../../../hooks/useAdminTeams';
import { useDepartments } from '../../../hooks/useDepartments';
import { createTeam, updateTeam, deleteTeam } from '../../../lib/adminApi/teams';
import {
  getAdminErrorMessage,
  isAdminAuthError,
} from '../../../lib/adminApi/errors';
import { TeamListTable } from './TeamListTable';
import { TeamFormModal } from './TeamFormModal';
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog';
import { SectionHeader } from '../SectionHeader';

interface TeamsSectionProps {
  authToken: string;
  showToast: (message: string, type?: 'error' | 'success') => void;
}

export function TeamsSection({
  authToken,
  showToast,
}: TeamsSectionProps): JSX.Element {
  const {
    teams,
    isLoading: isTeamsLoading,
    error: teamsError,
    refetch,
  } = useAdminTeams({ authToken });
  const { departments, isLoading: isDepartmentsLoading } = useDepartments();

  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formTarget, setFormTarget] = useState<AdminTeam | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AdminTeam | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 부서 chip 필터
  const [activeDeptId, setActiveDeptId] = useState<number | null>(null);
  const filteredTeams = useMemo(() => {
    if (activeDeptId === null) return teams;
    return teams.filter((t) => t.department?.id === activeDeptId);
  }, [teams, activeDeptId]);

  function handleAdd(): void {
    setFormMode('create');
    setFormTarget(null);
    setFormError(null);
    setIsFormOpen(true);
  }

  function handleEdit(team: AdminTeam): void {
    setFormMode('edit');
    setFormTarget(team);
    setFormError(null);
    setIsFormOpen(true);
  }

  function handleDeleteRequest(team: AdminTeam): void {
    setDeleteTarget(team);
  }

  function handleFormClose(): void {
    if (isSubmitting) return;
    setIsFormOpen(false);
    setFormError(null);
  }

  async function handleFormSubmit(
    payload: AdminTeamWritePayload,
  ): Promise<void> {
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (formMode === 'create') {
        await createTeam(authToken, payload);
        showToast('팀이 추가되었습니다.', 'success');
      } else if (formTarget !== null) {
        await updateTeam(authToken, formTarget.id, payload);
        showToast('팀이 수정되었습니다.', 'success');
      }
      setIsFormOpen(false);
      await refetch();
    } catch (err: unknown) {
      const message = getAdminErrorMessage(
        err,
        formMode === 'create'
          ? '팀 추가 중 오류가 발생했습니다.'
          : '팀 수정 중 오류가 발생했습니다.',
      );
      if (isAdminAuthError(err)) {
        showToast(message, 'error');
      }
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteConfirm(): Promise<void> {
    if (deleteTarget === null) return;
    setIsDeleting(true);
    try {
      await deleteTeam(authToken, deleteTarget.id);
      showToast('팀이 삭제되었습니다.', 'success');
      setDeleteTarget(null);
      await refetch();
    } catch (err: unknown) {
      const message = getAdminErrorMessage(
        err,
        '팀 삭제 중 오류가 발생했습니다.',
      );
      showToast(message, 'error');
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

  const isLoading = isTeamsLoading || isDepartmentsLoading;

  return (
    <div>
      <SectionHeader
        title="팀 관리"
        subtitle={isLoading ? undefined : `전체 ${String(teams.length)}팀`}
        actions={
          <button
            type="button"
            onClick={handleAdd}
            className="bg-primary text-white rounded-xl px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            + 팀 추가
          </button>
        }
      />


      {teamsError !== null && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 mb-4"
        >
          {teamsError}
        </div>
      )}

      {!isLoading && departments.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2" data-testid="team-dept-chip-filter">
          <DeptChip
            label="전체"
            isActive={activeDeptId === null}
            onClick={() => setActiveDeptId(null)}
          />
          {departments.map((dept) => (
            <DeptChip
              key={dept.id}
              label={dept.name}
              isActive={activeDeptId === dept.id}
              onClick={() => setActiveDeptId(dept.id)}
            />
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          <div className="animate-pulse bg-gray-200 rounded h-10" />
          <div className="animate-pulse bg-gray-200 rounded h-10" />
          <div className="animate-pulse bg-gray-200 rounded h-10" />
        </div>
      ) : (
        <TeamListTable
          teams={filteredTeams}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
        />
      )}

      <TeamFormModal
        isOpen={isFormOpen}
        mode={formMode}
        entity={formTarget}
        departments={departments}
        isSubmitting={isSubmitting}
        errorMessage={formError}
        onSubmit={handleFormSubmit}
        onClose={handleFormClose}
      />

      <ConfirmDeleteDialog
        isOpen={deleteTarget !== null}
        title={
          deleteTarget === null
            ? ''
            : `팀 '${deleteTarget.name}' 을(를) 삭제하시겠습니까?`
        }
        description="이 작업은 되돌릴 수 없습니다."
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        isLoading={isDeleting}
      />
    </div>
  );
}

interface DeptChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function DeptChip({ label, isActive, onClick }: DeptChipProps): JSX.Element {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={
        'rounded-full px-3.5 py-1.5 text-[12px] font-bold tracking-[-0.01em] transition-colors ' +
        (isActive
          ? 'bg-primary text-white shadow-design-primary'
          : 'bg-surface text-ink-soft border border-edge hover:bg-primary-50')
      }
    >
      {label}
    </button>
  );
}

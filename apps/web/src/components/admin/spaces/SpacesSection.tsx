import { useState } from 'react';
import type { AdminSpace, AdminSpaceWritePayload } from '../../../types';
import { useAdminSpaces } from '../../../hooks/useAdminSpaces';
import { useAdminBuildings } from '../../../hooks/useAdminBuildings';
import {
  createSpace,
  updateSpace,
  deleteSpace,
} from '../../../lib/adminApi/spaces';
import {
  getAdminErrorMessage,
  isAdminAuthError,
} from '../../../lib/adminApi/errors';
import { SpaceListTable } from './SpaceListTable';
import { SpaceFormModal } from './SpaceFormModal';
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog';

interface SpacesSectionProps {
  authToken: string;
  showToast: (message: string, type?: 'error' | 'success') => void;
}

export function SpacesSection({
  authToken,
  showToast,
}: SpacesSectionProps): JSX.Element {
  const {
    spaces,
    isLoading: isSpacesLoading,
    error: spacesError,
    refetch,
  } = useAdminSpaces({ authToken });
  const { buildings, isLoading: isBuildingsLoading } = useAdminBuildings({
    authToken,
  });

  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formTarget, setFormTarget] = useState<AdminSpace | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AdminSpace | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleAdd(): void {
    setFormMode('create');
    setFormTarget(null);
    setFormError(null);
    setIsFormOpen(true);
  }

  function handleEdit(space: AdminSpace): void {
    setFormMode('edit');
    setFormTarget(space);
    setFormError(null);
    setIsFormOpen(true);
  }

  function handleDeleteRequest(space: AdminSpace): void {
    setDeleteTarget(space);
  }

  function handleFormClose(): void {
    if (isSubmitting) return;
    setIsFormOpen(false);
    setFormError(null);
  }

  async function handleFormSubmit(
    payload: AdminSpaceWritePayload,
  ): Promise<void> {
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (formMode === 'create') {
        await createSpace(authToken, payload);
        showToast('공간이 추가되었습니다.', 'success');
      } else if (formTarget !== null) {
        await updateSpace(authToken, formTarget.id, payload);
        showToast('공간이 수정되었습니다.', 'success');
      }
      setIsFormOpen(false);
      await refetch();
    } catch (err: unknown) {
      const message = getAdminErrorMessage(
        err,
        formMode === 'create'
          ? '공간 추가 중 오류가 발생했습니다.'
          : '공간 수정 중 오류가 발생했습니다.',
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
      await deleteSpace(authToken, deleteTarget.id);
      showToast('공간이 삭제되었습니다.', 'success');
      setDeleteTarget(null);
      await refetch();
    } catch (err: unknown) {
      const message = getAdminErrorMessage(
        err,
        '공간 삭제 중 오류가 발생했습니다.',
      );
      showToast(message, 'error');
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

  const isLoading = isSpacesLoading || isBuildingsLoading;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-black">공간 관리</h2>
        <button
          type="button"
          onClick={handleAdd}
          disabled={buildings.length === 0}
          className="bg-brand-primary text-white rounded-xl px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          title={
            buildings.length === 0
              ? '먼저 건물을 등록해야 공간을 추가할 수 있습니다.'
              : undefined
          }
        >
          + 공간 추가
        </button>
      </div>

      {spacesError !== null && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 mb-4"
        >
          {spacesError}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          <div className="animate-pulse bg-gray-200 rounded h-10" />
          <div className="animate-pulse bg-gray-200 rounded h-10" />
          <div className="animate-pulse bg-gray-200 rounded h-10" />
        </div>
      ) : (
        <SpaceListTable
          spaces={spaces}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
        />
      )}

      <SpaceFormModal
        isOpen={isFormOpen}
        mode={formMode}
        entity={formTarget}
        buildings={buildings}
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
            : `공간 '${deleteTarget.name}' 을(를) 삭제하시겠습니까?`
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

import { useState } from 'react';
import type {
  AdminBuilding,
  AdminBuildingWritePayload,
} from '../../../types';
import { useAdminBuildings } from '../../../hooks/useAdminBuildings';
import {
  createBuilding,
  updateBuilding,
  deleteBuilding,
} from '../../../lib/adminApi/buildings';
import {
  getAdminErrorMessage,
  isAdminAuthError,
} from '../../../lib/adminApi/errors';
import { BuildingListTable } from './BuildingListTable';
import { BuildingFormModal } from './BuildingFormModal';
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog';
import { SectionHeader } from '../SectionHeader';

interface BuildingsSectionProps {
  authToken: string;
  showToast: (message: string, type?: 'error' | 'success') => void;
}

export function BuildingsSection({
  authToken,
  showToast,
}: BuildingsSectionProps): JSX.Element {
  const { buildings, isLoading, error, refetch } = useAdminBuildings({
    authToken,
  });

  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formTarget, setFormTarget] = useState<AdminBuilding | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AdminBuilding | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleAdd(): void {
    setFormMode('create');
    setFormTarget(null);
    setFormError(null);
    setIsFormOpen(true);
  }

  function handleEdit(building: AdminBuilding): void {
    setFormMode('edit');
    setFormTarget(building);
    setFormError(null);
    setIsFormOpen(true);
  }

  function handleDeleteRequest(building: AdminBuilding): void {
    setDeleteTarget(building);
  }

  function handleFormClose(): void {
    if (isSubmitting) return;
    setIsFormOpen(false);
    setFormError(null);
  }

  async function handleFormSubmit(
    payload: AdminBuildingWritePayload,
  ): Promise<void> {
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (formMode === 'create') {
        await createBuilding(authToken, payload);
        showToast('건물이 추가되었습니다.', 'success');
      } else if (formTarget !== null) {
        await updateBuilding(authToken, formTarget.id, payload);
        showToast('건물이 수정되었습니다.', 'success');
      }
      setIsFormOpen(false);
      await refetch();
    } catch (err: unknown) {
      const message = getAdminErrorMessage(
        err,
        formMode === 'create'
          ? '건물 추가 중 오류가 발생했습니다.'
          : '건물 수정 중 오류가 발생했습니다.',
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
      await deleteBuilding(authToken, deleteTarget.id);
      showToast('건물이 삭제되었습니다.', 'success');
      setDeleteTarget(null);
      await refetch();
    } catch (err: unknown) {
      // conflict (활성 공간 존재) 도 동일하게 백엔드 message 노출
      const message = getAdminErrorMessage(
        err,
        '건물 삭제 중 오류가 발생했습니다.',
      );
      showToast(message, 'error');
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <SectionHeader
        title="건물 관리"
        subtitle={isLoading ? undefined : `전체 ${String(buildings.length)}동`}
        actions={
          <button
            type="button"
            onClick={handleAdd}
            className="bg-primary text-white rounded-xl px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            + 건물 추가
          </button>
        }
      />


      {error !== null && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 mb-4"
        >
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          <div className="animate-pulse bg-gray-200 rounded h-10" />
          <div className="animate-pulse bg-gray-200 rounded h-10" />
        </div>
      ) : (
        <BuildingListTable
          buildings={buildings}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
        />
      )}

      <BuildingFormModal
        isOpen={isFormOpen}
        mode={formMode}
        entity={formTarget}
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
            : `건물 '${deleteTarget.name}' 을(를) 삭제하시겠습니까?`
        }
        description="활성 공간이 등록되어 있으면 삭제할 수 없습니다."
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        isLoading={isDeleting}
      />
    </div>
  );
}

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageSkeleton } from '@/shared/components/LoadingSkeleton';
import { ErrorState } from '@/shared/components/ErrorState';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { useSetBreadcrumb } from '@/shared/context/BreadcrumbContext';
import { ROUTES } from '@/shared/constants/routes';
import { useDesign } from '../hooks/useDesigns';
import { useArchiveDesign } from '../hooks/useDesignMutations';
import { DesignWorkspace } from '../components/DesignWorkspace';

export const DesignDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const archiveDialog = useDisclosure();

  const { data, isLoading, isError, refetch } = useDesign(id);
  const archiveMutation = useArchiveDesign();

  useSetBreadcrumb(id, data?.design?.designCode || data?.design?.name);


  const handleConfirmArchive = async () => {
    if (id) {
      await archiveMutation.mutateAsync(id);
      archiveDialog.onClose();
      navigate(ROUTES.DESIGNS.LIST);
    }
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError || !data?.design) {
    return (
      <div className="space-y-6">
        <PageHeader title="Design Details" />
        <ErrorState
          title="Design Not Found"
          message="The requested design record could not be loaded."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.design.name}
        description={`Design Workspace (${data.design.designCode})`}
      />

      <DesignWorkspace
        design={data.design}
        onArchiveClick={archiveDialog.onOpen}
      />

      {/* Confirm Archive Dialog */}
      <ConfirmDialog
        isOpen={archiveDialog.isOpen}
        title="Archive Design?"
        description={`Are you sure you want to archive '${data.design.name}'? Historical job records will remain unchanged.`}
        confirmText="Archive"
        cancelText="Cancel"
        isDestructive
        isLoading={archiveMutation.isPending}
        onConfirm={handleConfirmArchive}
        onCancel={archiveDialog.onClose}
      />
    </div>
  );
};

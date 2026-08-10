import React from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageSkeleton } from '@/shared/components/LoadingSkeleton';
import { ErrorState } from '@/shared/components/ErrorState';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { useSetBreadcrumb } from '@/shared/context/BreadcrumbContext';
import { useJob } from '@/features/jobs';
import {
  useAssignOperator,
  useCompleteProduction,
  useMarkReadyForDelivery,
  useRecordQualityCheck,
  useStartProduction,
} from '../hooks/useProductionMutations';
import { ProductionWorkspace } from '../components/ProductionWorkspace';
import { AssignOperatorModal } from '../components/AssignOperatorModal';
import { QualityCheckModal } from '../components/QualityCheckModal';
import type { AssignOperatorFormValues, QualityCheckFormValues } from '../schemas/production.schema';

export const ProductionWorkspacePage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const assignModal = useDisclosure();
  const qcModal = useDisclosure();

  const { data, isLoading, isError, refetch } = useJob(id);

  useSetBreadcrumb(id, data?.job?.jobNo);


  const startMutation = useStartProduction();
  const completeMutation = useCompleteProduction();
  const assignMutation = useAssignOperator();
  const qcMutation = useRecordQualityCheck();
  const deliverMutation = useMarkReadyForDelivery();

  const handleStartProduction = async () => {
    if (id) await startMutation.mutateAsync({ jobId: id });
  };

  const handleCompleteProduction = async () => {
    if (id) await completeMutation.mutateAsync({ jobId: id });
  };

  const handleMarkReadyForDelivery = async () => {
    if (id) await deliverMutation.mutateAsync({ jobId: id });
  };

  const handleConfirmAssign = async (values: AssignOperatorFormValues) => {
    const targetId = id || values.jobId || data?.job.id;
    if (!targetId) return;

    await assignMutation.mutateAsync({
      jobId: targetId,
      assignedOperator: values.assignedOperator.trim(),
    });
    assignModal.onClose();
  };

  const handleConfirmQC = async (values: QualityCheckFormValues) => {
    const targetId = id || values.jobId || data?.job.id;
    if (!targetId) return;

    await qcMutation.mutateAsync({
      jobId: targetId,
      passed: values.passed,
      notes: values.notes?.trim() || undefined,
    });
    qcModal.onClose();
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError || !data?.job) {
    return (
      <div className="space-y-6">
        <PageHeader title="Production Workspace" />
        <ErrorState
          title="Job Not Found"
          message="Could not retrieve the production specifications for this job."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const isPendingAction =
    startMutation.isPending || completeMutation.isPending || deliverMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Production — ${data.job.jobNo}`}
        description={`Production Workspace for ${data.job.customer?.name || 'Job Order'}`}
      />

      <ProductionWorkspace
        job={data.job}
        onStartProduction={handleStartProduction}
        onCompleteProduction={handleCompleteProduction}
        onAssignOperatorClick={assignModal.onOpen}
        onQualityCheckClick={qcModal.onOpen}
        onMarkReadyForDelivery={handleMarkReadyForDelivery}
        isPendingAction={isPendingAction}
      />

      {/* Assign Operator Modal */}
      <AssignOperatorModal
        isOpen={assignModal.isOpen}
        jobId={data.job.id}
        jobNo={data.job.jobNo}
        currentOperator={data.job.assignedOperator}
        isLoading={assignMutation.isPending}
        onConfirm={handleConfirmAssign}
        onCancel={assignModal.onClose}
      />

      {/* Quality Check Modal */}
      <QualityCheckModal
        isOpen={qcModal.isOpen}
        jobId={data.job.id}
        jobNo={data.job.jobNo}
        isLoading={qcMutation.isPending}
        onConfirm={handleConfirmQC}
        onCancel={qcModal.onClose}
      />
    </div>
  );
};

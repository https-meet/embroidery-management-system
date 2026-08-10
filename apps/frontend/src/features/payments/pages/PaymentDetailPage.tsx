import React from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageSkeleton } from '@/shared/components/LoadingSkeleton';
import { ErrorState } from '@/shared/components/ErrorState';
import { useSetBreadcrumb } from '@/shared/context/BreadcrumbContext';
import { usePayment } from '../hooks/usePayments';
import { PaymentWorkspace } from '../components/PaymentWorkspace';

export const PaymentDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = usePayment(id);

  useSetBreadcrumb(id, data?.payment?.paymentNo);


  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError || !data?.payment) {
    return (
      <div className="space-y-6">
        <PageHeader title="Payment Receipt" />
        <ErrorState
          title="Payment Not Found"
          message="The requested payment receipt record could not be loaded."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.payment.paymentNo}
        description={`Payment Receipt — ${data.payment.customer?.name || 'Customer Transaction'}`}
      />

      <PaymentWorkspace payment={data.payment} />
    </div>
  );
};

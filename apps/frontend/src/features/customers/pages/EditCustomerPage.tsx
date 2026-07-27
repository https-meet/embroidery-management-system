import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageSkeleton } from '@/shared/components/LoadingSkeleton';
import { ErrorState } from '@/shared/components/ErrorState';
import { ROUTES } from '@/shared/constants/routes';
import { isApiBusinessError, isApiValidationError } from '@/shared/types/api.types';
import { toast } from 'sonner';
import { useCustomer } from '../hooks/useCustomers';
import { useUpdateCustomer } from '../hooks/useCustomerMutations';
import { CustomerForm } from '../components/CustomerForm';
import type { CustomerFormValues } from '../schemas/customer.schema';

export const EditCustomerPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useCustomer(id);
  const updateMutation = useUpdateCustomer();

  const handleSubmit = async (values: CustomerFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id,
        dto: {
          name: values.name.trim(),
          customerType: values.customerType,
          contactPerson: values.contactPerson?.trim() || undefined,
          mobile: values.mobile?.trim() || undefined,
          alternateMobile: values.alternateMobile?.trim() || undefined,
          email: values.email?.trim() || undefined,
          address: values.address?.trim() || undefined,
          notes: values.notes?.trim() || undefined,
        },
      });

      navigate(ROUTES.CUSTOMERS.DETAIL(id));
    } catch (err: unknown) {
      if (isApiBusinessError(err)) {
        toast.error(err.error.message);
      } else if (isApiValidationError(err)) {
        toast.error('Please fix the validation errors in the form.');
      } else {
        toast.error('Failed to update customer.');
      }
    }
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError || !data?.customer) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Customer" />
        <ErrorState
          title="Customer Not Found"
          message="Could not load the customer details for editing."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const initialValues: Partial<CustomerFormValues> = {
    name: data.customer.name,
    customerType: data.customer.customerType,
    contactPerson: data.customer.contactPerson || '',
    mobile: data.customer.mobile || '',
    alternateMobile: data.customer.alternateMobile || '',
    email: data.customer.email || '',
    address: data.customer.address || '',
    notes: data.customer.notes || '',
    isActive: data.customer.isActive,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${data.customer.name}`}
        description={`Update customer details for ${data.customer.customerCode}`}
      />

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <CustomerForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
          onCancel={() => navigate(ROUTES.CUSTOMERS.DETAIL(id))}
        />
      </div>
    </div>
  );
};

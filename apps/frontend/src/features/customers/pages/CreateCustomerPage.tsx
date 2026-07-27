import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { ROUTES } from '@/shared/constants/routes';
import { isApiBusinessError, isApiValidationError } from '@/shared/types/api.types';
import { toast } from 'sonner';
import { useCreateCustomer } from '../hooks/useCustomerMutations';
import { CustomerForm } from '../components/CustomerForm';
import type { CustomerFormValues } from '../schemas/customer.schema';

export const CreateCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateCustomer();

  const handleSubmit = async (values: CustomerFormValues) => {
    try {
      const data = await createMutation.mutateAsync({
        name: values.name.trim(),
        customerType: values.customerType,
        contactPerson: values.contactPerson?.trim() || undefined,
        mobile: values.mobile?.trim() || undefined,
        alternateMobile: values.alternateMobile?.trim() || undefined,
        email: values.email?.trim() || undefined,
        address: values.address?.trim() || undefined,
        notes: values.notes?.trim() || undefined,
      });

      navigate(ROUTES.CUSTOMERS.DETAIL(data.customer.id));
    } catch (err: unknown) {
      if (isApiBusinessError(err)) {
        toast.error(err.error.message);
      } else if (isApiValidationError(err)) {
        toast.error('Please fix the validation errors in the form.');
      } else {
        toast.error('Failed to create customer.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Customer"
        description="Register a new customer for embroidery orders and job tracking."
      />

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <CustomerForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
          onCancel={() => navigate(ROUTES.CUSTOMERS.LIST)}
        />
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Sparkles, Building2, UserPlus, Briefcase, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { FormField } from '@/shared/components/FormField';
import { useUpdateBusinessSettings } from '@/features/settings/hooks/useBusinessSettings';
import { useCreateCustomer } from '@/features/customers/hooks/useCustomerMutations';
import { useCreateJob } from '@/features/jobs/hooks/useJobMutations';
import { toast } from 'sonner';

export interface OnboardingWizardModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 State: Firm Details
  const [companyName, setCompanyName] = useState('Royal Embroidery Works');
  const [gstin, setGstin] = useState('24AAAAA0000A1Z5');
  const [mobile, setMobile] = useState('+91 98765 43210');

  // Step 2 State: First Customer
  const [customerName, setCustomerName] = useState('Apex Fashions Pvt Ltd');
  const [customerMobile, setCustomerMobile] = useState('+91 91234 56789');
  const [createdCustomerId, setCreatedCustomerId] = useState<string | null>(null);

  // Step 3 State: First Job
  const [jobPosition, setJobPosition] = useState('Left Chest Logo');
  const [jobQuantity, setJobQuantity] = useState(50);
  const [jobRate, setJobRate] = useState(45);

  const updateSettingsMutation = useUpdateBusinessSettings();
  const createCustomerMutation = useCreateCustomer();
  const createJobMutation = useCreateJob();

  if (!isOpen) return null;

  const handleStep1 = async () => {
    await updateSettingsMutation.mutateAsync({
      companyName,
      gstin,
      mobile,
    });
    setStep(2);
  };

  const handleStep2 = async () => {
    try {
      const res = await createCustomerMutation.mutateAsync({
        name: customerName,
        mobile: customerMobile,
        customerType: 'COMPANY',
      });
      setCreatedCustomerId(res.customer.id);
      setStep(3);
    } catch {
      toast.error('Failed to create initial customer.');
    }
  };

  const handleStep3 = async () => {
    if (!createdCustomerId) return;
    try {
      await createJobMutation.mutateAsync({
        customerId: createdCustomerId,
        priority: 'NORMAL',
        items: [
          {
            position: jobPosition,
            quantity: jobQuantity,
            rate: jobRate,
          },
        ],
      });
      toast.success('Onboarding complete! First customer and job order initialized.');
      localStorage.setItem('ebms_onboarding_completed', 'true');
      onComplete();
    } catch {
      toast.error('Failed to create initial job order.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog">
      <div className="w-full max-w-xl rounded-xl border bg-card p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3 border-b pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Welcome to EBMS Setup Wizard</h2>
            <p className="text-xs text-muted-foreground">
              Commercial Onboarding — Step {step} of 3
            </p>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
          <div className={`p-2 rounded-md border ${step === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground'}`}>
            1. Firm Details
          </div>
          <div className={`p-2 rounded-md border ${step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground'}`}>
            2. First Customer
          </div>
          <div className={`p-2 rounded-md border ${step === 3 ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground'}`}>
            3. First Job Order
          </div>
        </div>

        {/* Step 1 Form */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center space-x-2 text-sm font-semibold text-foreground">
              <Building2 className="h-4 w-4 text-primary" />
              <span>Configure Your Embroidery Firm Profile</span>
            </div>
            <FormField label="Firm / Business Name" required>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </FormField>
            <FormField label="GSTIN Number">
              <Input value={gstin} onChange={(e) => setGstin(e.target.value)} />
            </FormField>
            <FormField label="Contact Mobile Number">
              <Input value={mobile} onChange={(e) => setMobile(e.target.value)} />
            </FormField>
            <Button
              type="button"
              className="w-full flex items-center justify-center space-x-2"
              onClick={handleStep1}
              isLoading={updateSettingsMutation.isPending}
            >
              <span>Save Firm Details & Next</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2 Form */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center space-x-2 text-sm font-semibold text-foreground">
              <UserPlus className="h-4 w-4 text-primary" />
              <span>Add Your First Master Customer</span>
            </div>
            <FormField label="Customer / Client Name" required>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </FormField>
            <FormField label="Mobile Number">
              <Input value={customerMobile} onChange={(e) => setCustomerMobile(e.target.value)} />
            </FormField>
            <Button
              type="button"
              className="w-full flex items-center justify-center space-x-2"
              onClick={handleStep2}
              isLoading={createCustomerMutation.isPending}
            >
              <span>Create Customer & Next</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 3 Form */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center space-x-2 text-sm font-semibold text-foreground">
              <Briefcase className="h-4 w-4 text-primary" />
              <span>Create Your First Operational Job Order</span>
            </div>
            <FormField label="Embroidery Placement / Position" required>
              <Input value={jobPosition} onChange={(e) => setJobPosition(e.target.value)} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Quantity (Pcs)" required>
                <Input
                  type="number"
                  value={jobQuantity}
                  onChange={(e) => setJobQuantity(Number(e.target.value))}
                />
              </FormField>
              <FormField label="Rate per Piece (₹)" required>
                <Input
                  type="number"
                  value={jobRate}
                  onChange={(e) => setJobRate(Number(e.target.value))}
                />
              </FormField>
            </div>
            <Button
              type="button"
              className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleStep3}
              isLoading={createJobMutation.isPending}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Complete Setup & Launch Dashboard</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

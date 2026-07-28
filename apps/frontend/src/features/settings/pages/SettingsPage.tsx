import React, { useState } from 'react';
import { Building2, CreditCard, Sliders, Users, ShieldCheck, HardDrive, Activity, History } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageSkeleton } from '@/shared/components/LoadingSkeleton';
import { SystemBackupCard } from '@/features/reports/components/SystemBackupCard';
import { useBusinessSettings, useUpdateBusinessSettings } from '../hooks/useBusinessSettings';
import { CompanySettingsCard } from '../components/CompanySettingsCard';
import { BillingSettingsCard } from '../components/BillingSettingsCard';
import { TaxFormatsCard } from '../components/TaxFormatsCard';
import { PermissionsMatrixCard } from '../components/PermissionsMatrixCard';
import { UserProfileCard } from '../components/UserProfileCard';
import { ChangePasswordForm } from '../components/ChangePasswordForm';
import { SystemHealthCard } from '../components/SystemHealthCard';
import { AuditLogViewer } from '../components/AuditLogViewer';
import type { BusinessConfig } from '../hooks/useBusinessSettings';

type SettingsTab = 'company' | 'billing' | 'tax' | 'users' | 'security' | 'audit' | 'backups' | 'system';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');
  const { data, isLoading } = useBusinessSettings();
  const updateMutation = useUpdateBusinessSettings();

  const handleSaveConfig = async (dto: Partial<BusinessConfig>) => {
    await updateMutation.mutateAsync(dto);
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & System Configuration"
        description="Centralized business configuration, firm profiles, numbering formats, user permissions, audit logs, and system diagnostics."
      />

      {/* 8-Section Navigation Tabs */}
      <div className="flex flex-wrap border-b gap-1">
        <TabButton
          active={activeTab === 'company'}
          onClick={() => setActiveTab('company')}
          icon={<Building2 className="h-4 w-4" />}
          label="Company Profile"
        />
        <TabButton
          active={activeTab === 'billing'}
          onClick={() => setActiveTab('billing')}
          icon={<CreditCard className="h-4 w-4" />}
          label="Billing & Banking"
        />
        <TabButton
          active={activeTab === 'tax'}
          onClick={() => setActiveTab('tax')}
          icon={<Sliders className="h-4 w-4" />}
          label="Tax & Formats"
        />
        <TabButton
          active={activeTab === 'users'}
          onClick={() => setActiveTab('users')}
          icon={<Users className="h-4 w-4" />}
          label="Users & Capabilities"
        />
        <TabButton
          active={activeTab === 'audit'}
          onClick={() => setActiveTab('audit')}
          icon={<History className="h-4 w-4" />}
          label="Audit Trail"
        />
        <TabButton
          active={activeTab === 'security'}
          onClick={() => setActiveTab('security')}
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Security"
        />
        <TabButton
          active={activeTab === 'backups'}
          onClick={() => setActiveTab('backups')}
          icon={<HardDrive className="h-4 w-4" />}
          label="Backups"
        />
        <TabButton
          active={activeTab === 'system'}
          onClick={() => setActiveTab('system')}
          icon={<Activity className="h-4 w-4" />}
          label="System Health"
        />
      </div>

      {/* Section Panels */}
      {activeTab === 'company' && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <CompanySettingsCard
            config={data?.config}
            onSave={handleSaveConfig}
            isLoading={updateMutation.isPending}
          />
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <BillingSettingsCard
            config={data?.config}
            onSave={handleSaveConfig}
            isLoading={updateMutation.isPending}
          />
        </div>
      )}

      {activeTab === 'tax' && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <TaxFormatsCard
            config={data?.config}
            onSave={handleSaveConfig}
            isLoading={updateMutation.isPending}
          />
        </div>
      )}

      {activeTab === 'users' && (
        <PermissionsMatrixCard />
      )}

      {activeTab === 'audit' && (
        <AuditLogViewer />
      )}

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <UserProfileCard />
          <ChangePasswordForm />
        </div>
      )}

      {activeTab === 'backups' && (
        <div className="max-w-3xl">
          <SystemBackupCard />
        </div>
      )}

      {activeTab === 'system' && (
        <SystemHealthCard />
      )}
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center space-x-1.5 border-b-2 px-3 py-2 text-xs font-semibold transition-colors ${
      active
        ? 'border-primary text-primary bg-primary/5 rounded-t-md'
        : 'border-transparent text-muted-foreground hover:border-muted hover:text-foreground'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

import React, { useState } from 'react';
import { Building2, User, Sliders } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { useSettings } from '../hooks/useSettings';
import { BusinessSettingsForm } from '../components/BusinessSettingsForm';
import { UserProfileCard } from '../components/UserProfileCard';
import { ChangePasswordForm } from '../components/ChangePasswordForm';
import { AppPreferencesCard } from '../components/AppPreferencesCard';

type SettingsTab = 'business' | 'user' | 'preferences';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('business');
  const { settings, saveSettings } = useSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & System Configuration"
        description="Manage business firm details, tax parameters, user security, and interface preferences."
      />

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b space-x-2">
        <TabButton
          active={activeTab === 'business'}
          onClick={() => setActiveTab('business')}
          icon={<Building2 className="h-4 w-4" />}
          label="Business Profile"
        />
        <TabButton
          active={activeTab === 'user'}
          onClick={() => setActiveTab('user')}
          icon={<User className="h-4 w-4" />}
          label="User Profile & Security"
        />
        <TabButton
          active={activeTab === 'preferences'}
          onClick={() => setActiveTab('preferences')}
          icon={<Sliders className="h-4 w-4" />}
          label="Preferences"
        />
      </div>

      {/* Tab Panels */}
      {activeTab === 'business' && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <BusinessSettingsForm initialValues={settings} onSave={saveSettings} />
        </div>
      )}

      {activeTab === 'user' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <UserProfileCard />
          <ChangePasswordForm />
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="max-w-2xl">
          <AppPreferencesCard />
        </div>
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
    className={`flex items-center space-x-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
      active
        ? 'border-primary text-primary'
        : 'border-transparent text-muted-foreground hover:border-muted hover:text-foreground'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

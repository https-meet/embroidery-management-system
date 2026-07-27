import { useState } from 'react';
import { toast } from 'sonner';
import type { BusinessSettingsDto } from '../types/settings.types';

const SETTINGS_KEY = 'ebms_business_settings';

const DEFAULT_SETTINGS: BusinessSettingsDto = {
  companyName: 'EMBROIDERY BUSINESS',
  gstin: '24AAAAA0000A1Z5',
  mobile: '+91 98765 43210',
  email: 'info@embroidery.com',
  address: 'Ring Road, Surat, Gujarat - 395002, India',
  bankDetails: 'HDFC Bank, Surat Branch | A/C: 50200012345678 | IFSC: HDFC0000123',
  defaultNotes: 'Payment due within 15 days of invoice date. Thank you for your business.',
};

export function useSettings() {
  const [settings, setSettingsState] = useState<BusinessSettingsDto>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      return stored ? (JSON.parse(stored) as BusinessSettingsDto) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const saveSettings = (newSettings: BusinessSettingsDto) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettingsState(newSettings);
      toast.success('Business profile settings saved successfully.');
    } catch {
      toast.error('Failed to save business settings.');
    }
  };

  return {
    settings,
    saveSettings,
  };
}

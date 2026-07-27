export interface BusinessSettingsDto {
  companyName: string;
  gstin?: string;
  mobile?: string;
  email?: string;
  address?: string;
  bankDetails?: string;
  defaultNotes?: string;
}

export interface UserProfileSettingsDto {
  name: string;
  email: string;
  role: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AppPreferencesDto {
  currencySymbol: string;
  dateFormat: string;
  timezone: string;
}

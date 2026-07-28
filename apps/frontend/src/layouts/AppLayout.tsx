import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Breadcrumbs } from '@/shared/components/Breadcrumbs';
import { OnboardingWizardModal } from '@/shared/components/OnboardingWizardModal';
import { useCustomers } from '@/features/customers';

const SIDEBAR_COLLAPSED_KEY = 'ebms_sidebar_collapsed';

export const AppLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  const { data: customerData } = useCustomers({ limit: 1 });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isSidebarCollapsed));
    } catch {
      // Safe fallback if localStorage is disabled
    }
  }, [isSidebarCollapsed]);

  useEffect(() => {
    if (customerData && customerData.total === 0) {
      const completed = localStorage.getItem('ebms_onboarding_completed');
      if (!completed) {
        setIsOnboardingOpen(true);
      }
    }
  }, [customerData]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  const closeMobileNav = useCallback(() => {
    setIsMobileNavOpen(false);
  }, []);

  const openMobileNav = useCallback(() => {
    setIsMobileNavOpen(true);
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} />

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={closeMobileNav}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          onOpenMobileNav={openMobileNav}
          isMobileNavOpen={isMobileNavOpen}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <Breadcrumbs />
            <Outlet />
          </div>
        </main>
      </div>

      {/* Guided Onboarding Setup Wizard */}
      <OnboardingWizardModal
        isOpen={isOnboardingOpen}
        onComplete={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
};

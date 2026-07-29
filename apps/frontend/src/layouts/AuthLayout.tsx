import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ShieldCheck, Cpu, Layers, Sun, Moon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

/**
 * Unauthenticated layout container for authentication screens
 */
export const AuthLayout: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return (
        document.documentElement.classList.contains('dark') ||
        localStorage.getItem('ebms_theme') === 'dark'
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('ebms_theme', 'dark');
      } catch {}
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('ebms_theme', 'light');
      } catch {}
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12 bg-background text-foreground">
      {/* Left Panel: Enterprise Product Identity (Hidden on Mobile/Tablet) */}
      <div className="relative hidden lg:col-span-5 lg:flex flex-col justify-between p-8 xl:p-12 bg-slate-900 text-slate-50 border-r border-slate-800 overflow-hidden select-none">
        {/* Subtle Background Pattern Motif */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <path d="M0 20 H100 M0 40 H100 M0 60 H100 M0 80 H100 M20 0 V100 M40 0 V100 M60 0 V100 M80 0 V100" stroke="currentColor" strokeWidth="1" fill="none" />
          </svg>
        </div>

        {/* Top Brand Header */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg shadow-sm">
            E
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-tight">EBMS Enterprise</h1>
            <p className="text-xs text-slate-400">Embroidery Business Management</p>
          </div>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 space-y-8 my-auto max-w-sm">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold text-slate-300 border border-slate-700">
              Commercial Operations ERP
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Streamline production, quality, and cashflow.
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unified business platform engineered for daily embroidery order management, production scheduling, and financial auditing.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Real-Time Production Queue</h3>
                <p className="text-[11px] text-slate-400">Track machine status, priority deadlines, and line item progress.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Tax Invoicing & Cashflow</h3>
                <p className="text-[11px] text-slate-400">Generate printable GST invoices and track customer receivables.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Audit Trails & Data Backups</h3>
                <p className="text-[11px] text-slate-400">Full operation logs with automatic metadata backups.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-500 pt-6 border-t border-slate-800">
          <span>© EBMS v1.0 Commercial</span>
          <span>Authorized Access</span>
        </div>
      </div>

      {/* Right Panel: Primary Form Container */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 lg:p-12 relative min-h-screen lg:min-h-0">
        {/* Top Header Toolbar with Theme Toggle */}
        <div className="flex items-center justify-between w-full pb-4">
          <div className="flex items-center space-x-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
              E
            </div>
            <span className="font-bold text-foreground tracking-tight">EBMS</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-slate-700" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </Button>
        </div>

        {/* Center Auth Outlet Form */}
        <main className="my-auto w-full max-w-md mx-auto py-8">
          <div className="rounded-lg border border-border/70 bg-card p-6 sm:p-8 shadow-sm">
            <Outlet />
          </div>
        </main>

        {/* Mobile / General Footer */}
        <div className="text-center text-[11px] text-muted-foreground pt-4">
          <span>Embroidery Business Management System • Enterprise Software</span>
        </div>
      </div>
    </div>
  );
};


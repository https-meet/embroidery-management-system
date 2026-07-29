import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ShieldCheck, Cpu, Layers, Sun, Moon, Activity, CheckCircle2 } from 'lucide-react';
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
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12 bg-background text-foreground font-sans antialiased">
      {/* Left Panel: Premium Enterprise Showcase (Hidden on Mobile/Tablet) */}
      <div className="relative hidden lg:col-span-5 lg:flex flex-col justify-between p-10 xl:p-14 bg-slate-950 text-slate-50 border-r border-slate-800/80 overflow-hidden select-none">
        {/* Modern Ambient Radial Glow & Gradient Glow Effect */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Elegant Micro-Dot Mesh Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

        {/* Top Brand Header */}
        <div className="relative z-10 flex items-center space-x-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white font-black text-xl shadow-lg shadow-primary/25 ring-1 ring-white/20">
            E
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight flex items-center gap-2">
              <span>EBMS Enterprise</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary-foreground border border-primary/30">
                v1.0
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Embroidery Business Management System</p>
          </div>
        </div>

        {/* Middle Feature Highlights Container */}
        <div className="relative z-10 space-y-8 my-auto max-w-md">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-medium text-slate-300 border border-slate-800 shadow-sm backdrop-blur-md">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span>Commercial Operations ERP</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Precision control for embroidery operations.
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Centralized platform engineered for commercial embroidery production, design catalog management, customer 360 accounting, and GST tax invoicing.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start space-x-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 backdrop-blur-xs transition-colors hover:border-slate-700/80">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800/80 text-primary border border-slate-700/60 shadow-inner">
                <Cpu className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span>Real-Time Production Queue</span>
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                </h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Live tracking for machine allocation, stitch counts, and quality inspection stages.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 backdrop-blur-xs transition-colors hover:border-slate-700/80">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800/80 text-indigo-400 border border-slate-700/60 shadow-inner">
                <Layers className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-slate-100">Tax Invoicing & Receivables</h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Printable GST invoices, customer ledger balances, and payment tracking.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 backdrop-blur-xs transition-colors hover:border-slate-700/80">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800/80 text-emerald-400 border border-slate-700/60 shadow-inner">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-slate-100">Immutable Audit Trail</h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Complete action logging and offline JSON/CSV backup ledgers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-500 pt-6 border-t border-slate-800/80 font-mono">
          <span>© EBMS Commercial ERP</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Authorized Sign-In</span>
          </span>
        </div>
      </div>

      {/* Right Panel: Primary Form Container */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative min-h-screen lg:min-h-0 bg-background">
        {/* Top Header Toolbar with Theme Toggle */}
        <div className="flex items-center justify-between w-full pb-4">
          <div className="flex items-center space-x-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-base shadow-md">
              E
            </div>
            <span className="font-bold text-foreground tracking-tight text-base">EBMS Enterprise</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="ml-auto text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 border-border/80 shadow-xs"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-slate-700" />
                <span>Dark Mode</span>
              </>
            )}
          </Button>
        </div>

        {/* Center Auth Outlet Form */}
        <main className="my-auto w-full max-w-md mx-auto py-6">
          <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm transition-all duration-150">
            <Outlet />
          </div>
        </main>

        {/* Mobile / General Footer */}
        <div className="text-center text-[11px] text-muted-foreground pt-4 font-mono">
          <span>Embroidery Business Management System • Authorized Access Only</span>
        </div>
      </div>
    </div>
  );
};

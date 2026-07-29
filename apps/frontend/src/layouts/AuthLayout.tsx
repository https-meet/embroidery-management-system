import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ShieldCheck, Layers, Sun, Moon, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

/**
 * Unauthenticated layout container for login screens (Style Guide §8.1 Architectural Card Layout)
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
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col justify-between items-center p-4 sm:p-6 md:p-10 font-sans antialiased select-none">
      {/* Top Header Bar with Theme Toggle */}
      <div className="w-full max-w-4xl flex items-center justify-between py-2">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-base shadow-sm">
            E
          </div>
          <span className="font-bold text-foreground tracking-tight text-base">EBMS Enterprise</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 border-border shadow-xs"
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

      {/* Main Architectural Centered Card Container (Style Guide §8.1) */}
      <main className="w-full max-w-4xl my-auto">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_1.1fr] rounded-2xl border border-border bg-card shadow-xl shadow-slate-900/10 overflow-hidden">
          {/* Left Rail: Dark Slate Brand Showcase (Style Guide §8.1) */}
          <div className="relative hidden md:flex flex-col justify-between p-8 lg:p-10 bg-slate-950 text-slate-100 overflow-hidden">
            {/* Blue Glow Effect */}
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Radial Dot Pattern Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

            {/* Brand Title */}
            <div className="relative z-10 space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>EBMS Enterprise</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary-foreground border border-primary/30">
                  v1.0
                </span>
              </h2>
              <p className="text-xs text-slate-400">Embroidery Business Management System</p>
            </div>

            {/* Core Value Proposition & Trust Bullets */}
            <div className="relative z-10 space-y-6 my-auto py-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold tracking-tight text-white leading-snug">
                  Precision control for commercial embroidery operations.
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Engineered for real-time production queues, design pattern catalogs, customer 360 accounting, and compliant GST tax invoicing.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-center space-x-3 text-xs text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Real-time machine status & stitch count tracking</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-200">
                  <Layers className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Printable GST tax invoices & ledger balances</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-200">
                  <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>Immutable audit logs & offline backup tools</span>
                </div>
              </div>
            </div>

            {/* Footer Trust Indicator */}
            <div className="relative z-10 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
              <span>© EBMS Commercial ERP</span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Authorized Sign-In</span>
              </span>
            </div>
          </div>

          {/* Right Panel: Sign-In Form (Style Guide §8.1) */}
          <div className="p-8 sm:p-10 md:p-12 bg-card flex flex-col justify-center">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Footer Legal Notice */}
      <footer className="w-full max-w-4xl text-center text-xs text-muted-foreground py-2 font-mono">
        <span>Embroidery Business Management System • Authorized Personnel Only</span>
      </footer>
    </div>
  );
};

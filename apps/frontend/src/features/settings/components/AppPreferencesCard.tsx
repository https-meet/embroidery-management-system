import React, { useState, useEffect } from 'react';
import { Sliders, Sun, Moon, Globe } from 'lucide-react';
import { RupeeIcon } from '@/shared/components/icons/RupeeIcon';
import { Button } from '@/shared/components/ui/button';

export const AppPreferencesCard: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm space-y-6">
      <div className="flex items-center space-x-2 border-b pb-3">
        <Sliders className="h-5 w-5 text-primary" />
        <h3 className="text-base font-bold text-foreground">Application & Regional Preferences</h3>
      </div>

      <div className="space-y-4 text-xs">
        {/* Dark/Light Theme Toggle */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <span className="font-semibold text-sm text-foreground block">Appearance Theme</span>
            <p className="text-muted-foreground">Switch between Light and Dark interface themes</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="flex items-center space-x-2"
          >
            {isDarkMode ? (
              <>
                <Moon className="h-4 w-4 text-purple-400" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="h-4 w-4 text-amber-500" />
                <span>Light Mode</span>
              </>
            )}
          </Button>
        </div>

        {/* Currency Formatting */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center space-x-2">
            <RupeeIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <span className="font-semibold text-foreground block">Default Currency</span>
              <p className="text-muted-foreground">Indian Rupee (INR)</p>
            </div>
          </div>
          <span className="font-mono font-bold text-sm bg-muted px-2.5 py-1 rounded text-foreground">
            ₹ INR
          </span>
        </div>

        {/* Date Format */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <div>
              <span className="font-semibold text-foreground block">Date Standard</span>
              <p className="text-muted-foreground">Indian Standard Date Format</p>
            </div>
          </div>
          <span className="font-mono font-bold text-sm bg-muted px-2.5 py-1 rounded text-foreground">
            DD/MM/YYYY
          </span>
        </div>
      </div>
    </div>
  );
};

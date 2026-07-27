import React from 'react';
import { Button } from '@/components/ui/button';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Embroidery Business Management System
        </h1>
        <p className="mt-2 text-muted-foreground">
          Welcome to EBMS. The system foundation is successfully set up.
        </p>
        <div className="mt-6">
          <Button variant="default">System Operational</Button>
        </div>
      </div>
    </div>
  );
};

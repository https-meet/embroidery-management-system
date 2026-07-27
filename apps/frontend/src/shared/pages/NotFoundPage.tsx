import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';
import { Button } from '../components/ui/button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">404</h1>
      <h2 className="mt-2 text-lg font-semibold text-foreground">Page Not Found</h2>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-6">
        <Link to={ROUTES.DASHBOARD}>
          <Button variant="default" size="sm" className="flex items-center space-x-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

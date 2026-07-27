import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <h1 className="text-6xl font-extrabold text-foreground">404</h1>
      <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="pt-4">
        <Link to="/">
          <Button variant="default">Return to Home</Button>
        </Link>
      </div>
    </div>
  );
};

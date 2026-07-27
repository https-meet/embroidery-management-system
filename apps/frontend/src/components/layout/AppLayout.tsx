import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to="/" className="text-xl font-bold text-primary">
            EBMS
          </Link>
        </div>
        <nav className="flex items-center space-x-4 text-sm font-medium">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
        </nav>
      </header>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>

      <footer className="border-t border-border px-6 py-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Embroidery Business Management System
      </footer>
    </div>
  );
};

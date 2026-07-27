import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Palette,
  Activity,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
} from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    title: 'Customers',
    href: ROUTES.CUSTOMERS.LIST,
    icon: Users,
  },
  {
    title: 'Jobs',
    href: ROUTES.JOBS.LIST,
    icon: Briefcase,
  },
  {
    title: 'Designs',
    href: ROUTES.DESIGNS.LIST,
    icon: Palette,
  },
  {
    title: 'Production',
    href: ROUTES.PRODUCTION.LIST,
    icon: Activity,
  },
  {
    title: 'Invoices',
    href: ROUTES.INVOICES.LIST,
    icon: FileText,
  },
  {
    title: 'Payments',
    href: ROUTES.PAYMENTS.LIST,
    icon: CreditCard,
  },
  {
    title: 'Reports',
    href: ROUTES.REPORTS.ROOT,
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: ROUTES.SETTINGS,
    icon: Settings,
  },
];

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
  Package,
  Truck,
  ShoppingCart,
} from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: 'OPERATIONS',
    items: [
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
        title: 'Production',
        href: ROUTES.PRODUCTION.LIST,
        icon: Activity,
      },
      {
        title: 'Designs',
        href: ROUTES.DESIGNS.LIST,
        icon: Palette,
      },
    ],
  },
  {
    label: 'FINANCE',
    items: [
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
    ],
  },
  {
    label: 'INVENTORY',
    items: [
      {
        title: 'Materials',
        href: ROUTES.MATERIALS.LIST,
        icon: Package,
      },
      {
        title: 'Suppliers',
        href: ROUTES.SUPPLIERS.LIST,
        icon: Truck,
      },
      {
        title: 'Purchases',
        href: ROUTES.PURCHASES.LIST,
        icon: ShoppingCart,
      },
    ],
  },
  {
    label: 'ADMINISTRATION',
    items: [
      {
        title: 'Settings',
        href: ROUTES.SETTINGS,
        icon: Settings,
      },
    ],
  },
];

// Flat navItems exported array for backwards compatibility
export const navItems: NavItem[] = navGroups.flatMap((group) => group.items);

import React from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, Mail, MapPin, FileText, Calendar, Edit2, Archive, Briefcase } from 'lucide-react';
import { formatDate } from '@/shared/utils/formatDate';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/constants/routes';
import type { CustomerDto } from '../types/customer.types';

export interface CustomerWorkspaceProps {
  customer: CustomerDto;
  onArchiveClick: () => void;
}

export const CustomerWorkspace: React.FC<CustomerWorkspaceProps> = ({
  customer,
  onArchiveClick,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col space-y-4 rounded-lg border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {customer.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold tracking-tight text-foreground">{customer.name}</h2>
              <StatusBadge status={customer.isActive ? 'COMPLETED' : 'CANCELLED'} />
            </div>
            <p className="font-mono text-xs text-muted-foreground">{customer.customerCode} • {customer.customerType}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link to={`${ROUTES.CUSTOMERS.DETAIL(customer.id)}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center space-x-1.5">
              <Edit2 className="h-4 w-4" />
              <span>Edit Customer</span>
            </Button>
          </Link>
          {customer.isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={onArchiveClick}
              className="flex items-center space-x-1.5 text-destructive border-destructive/20 hover:bg-destructive/10"
            >
              <Archive className="h-4 w-4" />
              <span>Archive</span>
            </Button>
          )}
        </div>
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="space-y-4 rounded-lg border bg-card p-5 shadow-sm lg:col-span-2">
          <h3 className="text-base font-semibold tracking-tight text-foreground border-b pb-2">
            Contact & Profile Details
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start space-x-3">
              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Contact Person</p>
                <p className="text-sm font-semibold text-foreground">
                  {customer.contactPerson || '—'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Mobile Number</p>
                <p className="text-sm font-semibold text-foreground">{customer.mobile || '—'}</p>
                {customer.alternateMobile && (
                  <p className="text-xs text-muted-foreground">Alt: {customer.alternateMobile}</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Email Address</p>
                <p className="text-sm font-semibold text-foreground">{customer.email || '—'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Customer Since</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatDate(customer.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-3 space-y-3">
            <div className="flex items-start space-x-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Address</p>
                <p className="text-xs text-foreground whitespace-pre-line">
                  {customer.address || 'No address specified'}
                </p>
              </div>
            </div>

            {customer.notes && (
              <div className="flex items-start space-x-3 border-t pt-3">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Notes</p>
                  <p className="text-xs text-foreground whitespace-pre-line">{customer.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Financial & Job Quick Summary */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold tracking-tight text-foreground border-b pb-2">
              Workspace Overview
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Customer Status</span>
                <span className="font-semibold text-foreground">
                  {customer.isActive ? 'Active' : 'Archived'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-t pt-2">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium text-foreground">{customer.customerType}</span>
              </div>
            </div>
          </div>

          {/* Action Card */}
          <div className="rounded-lg border bg-card p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Customer Actions
            </h3>
            <div className="space-y-2">
              <Link to={ROUTES.JOBS.CREATE} className="block">
                <Button variant="outline" size="sm" className="w-full justify-start space-x-2">
                  <Briefcase className="h-4 w-4" />
                  <span>Create New Job</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

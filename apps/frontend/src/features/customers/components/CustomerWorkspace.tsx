import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Calendar,
  Edit2,
  Archive,
  Briefcase,
  CreditCard,
  TrendingUp,
  Clock,
  History,
  Plus,
} from 'lucide-react';
import { RupeeIcon } from '@/shared/components/icons/RupeeIcon';
import { formatDate } from '@/shared/utils/formatDate';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/constants/routes';
import type { Customer360Response } from '../hooks/useCustomer360';

export interface CustomerWorkspaceProps {
  data: Customer360Response;
  onArchiveClick: () => void;
}

export const CustomerWorkspace: React.FC<CustomerWorkspaceProps> = ({
  data,
  onArchiveClick,
}) => {
  const [activeTab, setActiveTab] = useState<'JOBS' | 'INVOICES' | 'PAYMENTS' | 'TIMELINE'>('JOBS');

  const { customer, summary, jobs, invoices, payments, timeline } = data;

  return (
    <div className="space-y-6">
      {/* Top Profile Header Card (Style Guide §8.4: 48px Avatar + Quick Actions) */}
      <div className="flex flex-col space-y-4 rounded-lg border border-border bg-card p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:space-y-0 select-none">
        <div className="flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary border border-primary/20 shrink-0">
            {customer.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">{customer.name}</h2>
              <StatusBadge status={customer.isActive ? 'ACTIVE' : 'INACTIVE'} />
            </div>
            <p className="font-mono text-xs text-muted-foreground mt-0.5">
              {customer.customerCode} • {customer.customerType}
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`${ROUTES.JOBS.CREATE}?customerId=${customer.id}`}>
            <Button size="sm" className="flex items-center space-x-1.5 h-8 text-xs font-semibold">
              <Plus className="h-3.5 w-3.5" />
              <span>New Job Order</span>
            </Button>
          </Link>
          <Link to={`${ROUTES.INVOICES.CREATE}?customerId=${customer.id}`}>
            <Button variant="outline" size="sm" className="flex items-center space-x-1.5 h-8 text-xs">
              <FileText className="h-3.5 w-3.5" />
              <span>Issue Invoice</span>
            </Button>
          </Link>
          <Link to={ROUTES.PAYMENTS.CREATE}>
            <Button variant="outline" size="sm" className="flex items-center space-x-1.5 h-8 text-xs">
              <RupeeIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Record Payment</span>
            </Button>
          </Link>
          <Link to={`${ROUTES.CUSTOMERS.DETAIL(customer.id)}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center space-x-1.5 h-8 text-xs">
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </Button>
          </Link>
          {customer.isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={onArchiveClick}
              className="flex items-center space-x-1.5 h-8 text-xs text-destructive border-destructive/20 hover:bg-destructive/10"
              title="Archive Customer"
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Customer 360 Financial KPI Stat Strip (Style Guide §8.4: Large tabular numbers) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Lifetime Revenue</p>
            <p className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
              {formatCurrency(summary.lifetimeRevenue)}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Outstanding Balance</p>
            <p
              className={`text-2xl font-semibold tracking-tight tabular-nums ${
                summary.outstandingBalance > 0 ? 'text-destructive' : 'text-foreground'
              }`}
            >
              {formatCurrency(summary.outstandingBalance)}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground">
            <CreditCard className="h-4 w-4" />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Active Production Jobs</p>
            <p className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
              {summary.activeJobs} of {summary.totalJobs}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground">
            <Briefcase className="h-4 w-4" />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Last Order Date</p>
            <p className="text-sm font-semibold font-mono tabular-nums text-foreground">
              {formatDate(summary.lastOrderDate, 'No orders yet')}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground">
            <Clock className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Main Grid: Left Contact Details & Right Workspace Tabs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Contact Profile & Internal Notes (4/12 Width) */}
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase border-b border-border pb-3">
              Contact Profile
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-3">
                <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-muted-foreground">Contact Person</p>
                  <p className="font-semibold text-foreground">{customer.contactPerson || '—'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-muted-foreground">Mobile Number</p>
                  <p className="font-semibold text-foreground font-mono tabular-nums">{customer.mobile || '—'}</p>
                  {customer.alternateMobile && <p className="text-muted-foreground font-mono tabular-nums">Alt: {customer.alternateMobile}</p>}
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-muted-foreground">Email Address</p>
                  <p className="font-semibold text-foreground">{customer.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-muted-foreground">Billing Address</p>
                  <p className="text-foreground whitespace-pre-line leading-relaxed">{customer.address || 'Unspecified'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 border-t border-border pt-3">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-muted-foreground">Customer Since</p>
                  <p className="font-semibold text-foreground font-mono tabular-nums">{formatDate(customer.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Internal Operational Notes
              </h3>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-foreground whitespace-pre-line bg-muted/40 p-3 rounded-md border border-border min-h-20 leading-relaxed">
              {customer.notes || 'No internal operational notes recorded for this customer.'}
            </p>
          </div>
        </div>

        {/* Customer 360 Embedded Workspace Tabs (8/12 Width - Style Guide §8.4) */}
        <div className="space-y-4 lg:col-span-8">
          {/* Tab Navigation Header */}
          <div className="flex items-center space-x-1 border-b border-border pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('JOBS')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 ${
                activeTab === 'JOBS'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Jobs & Orders ({jobs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('INVOICES')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 ${
                activeTab === 'INVOICES'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Invoices ({invoices.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PAYMENTS')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 ${
                activeTab === 'PAYMENTS'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Payments ({payments.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('TIMELINE')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 ${
                activeTab === 'TIMELINE'
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span>Timeline ({timeline.length})</span>
            </button>
          </div>

          {/* Jobs Tab View */}
          {activeTab === 'JOBS' && (
            <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
              {jobs.length === 0 ? (
                <p className="p-5 text-xs text-muted-foreground italic">No job orders found for this customer.</p>
              ) : (
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="h-10 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5">Job ID</th>
                      <th className="px-4 py-2.5">Priority</th>
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-muted/40 transition-colors duration-150">
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">{job.jobNo}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded px-2 py-0.5 text-[10px] font-semibold uppercase bg-muted text-muted-foreground border border-border">
                            {job.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground tabular-nums">{formatDate(job.jobDate)}</td>
                        <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                        <td className="px-4 py-3 text-right">
                          <Link to={ROUTES.JOBS.DETAIL(job.id)} className="text-primary hover:underline font-medium text-xs">
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Invoices Tab View */}
          {activeTab === 'INVOICES' && (
            <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
              {invoices.length === 0 ? (
                <p className="p-5 text-xs text-muted-foreground italic">No invoices issued for this customer.</p>
              ) : (
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="h-10 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5">Invoice ID</th>
                      <th className="px-4 py-2.5">Issue Date</th>
                      <th className="px-4 py-2.5 text-right">Grand Total</th>
                      <th className="px-4 py-2.5 text-right">Balance Due</th>
                      <th className="px-4 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-muted/40 transition-colors duration-150">
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                          <Link to={ROUTES.INVOICES.DETAIL(inv.id)} className="hover:underline">
                            {inv.invoiceNo}
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground tabular-nums">{formatDate(inv.invoiceDate)}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-foreground tabular-nums">{formatCurrency(inv.grandTotal)}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-foreground tabular-nums">{formatCurrency(inv.outstandingBalance)}</td>
                        <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Payments Tab View */}
          {activeTab === 'PAYMENTS' && (
            <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
              {payments.length === 0 ? (
                <p className="p-5 text-xs text-muted-foreground italic">No confirmed payments recorded for this customer.</p>
              ) : (
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="h-10 border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5">Payment ID</th>
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5">Method</th>
                      <th className="px-4 py-2.5">Reference</th>
                      <th className="px-4 py-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-muted/40 transition-colors duration-150">
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">{pay.paymentNo}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground tabular-nums">{formatDate(pay.paymentDate)}</td>
                        <td className="px-4 py-3 font-semibold text-foreground text-xs">{pay.paymentMethod}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{pay.referenceNo || 'N/A'}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-foreground tabular-nums">{formatCurrency(pay.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Timeline Stream Tab View */}
          {activeTab === 'TIMELINE' && (
            <div className="rounded-lg border border-border bg-card p-5 shadow-xs">
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {timeline.map((act) => (
                  <div key={act.id} className="relative flex items-start justify-between text-xs">
                    <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-card border border-border shadow-xs">
                      {act.type === 'JOB' ? <Briefcase className="h-3 w-3 text-muted-foreground" /> : act.type === 'INVOICE' ? <FileText className="h-3 w-3 text-muted-foreground" /> : <CreditCard className="h-3 w-3 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground leading-tight">{act.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{act.description}</p>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground tabular-nums shrink-0 ml-2">{formatDate(act.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

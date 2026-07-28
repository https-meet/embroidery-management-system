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
  DollarSign,
  TrendingUp,
  Clock,
  History,
  Plus,
} from 'lucide-react';
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
            <p className="font-mono text-xs text-muted-foreground">
              {customer.customerCode} • {customer.customerType}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to={`${ROUTES.JOBS.CREATE}?customerId=${customer.id}`}>
            <Button size="sm" className="flex items-center space-x-1">
              <Plus className="h-3.5 w-3.5" />
              <span>New Job Order</span>
            </Button>
          </Link>
          <Link to={`${ROUTES.INVOICES.CREATE}?customerId=${customer.id}`}>
            <Button variant="outline" size="sm" className="flex items-center space-x-1">
              <FileText className="h-3.5 w-3.5" />
              <span>Issue Invoice</span>
            </Button>
          </Link>
          <Link to={ROUTES.PAYMENTS.CREATE}>
            <Button variant="outline" size="sm" className="flex items-center space-x-1 text-emerald-600 border-emerald-300 hover:bg-emerald-50">
              <DollarSign className="h-3.5 w-3.5" />
              <span>Record Payment</span>
            </Button>
          </Link>
          <Link to={`${ROUTES.CUSTOMERS.DETAIL(customer.id)}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center space-x-1.5">
              <Edit2 className="h-4 w-4" />
              <span>Edit</span>
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
            </Button>
          )}
        </div>
      </div>

      {/* Contextual Customer Financial Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Lifetime Revenue</p>
            <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatCurrency(summary.lifetimeRevenue)}
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-emerald-500/20" />
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Outstanding Balance</p>
            <p
              className={`text-lg font-bold font-mono mt-0.5 ${
                summary.outstandingBalance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
              }`}
            >
              {formatCurrency(summary.outstandingBalance)}
            </p>
          </div>
          <CreditCard className="h-8 w-8 text-rose-500/20" />
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Active Production Jobs</p>
            <p className="text-lg font-bold font-mono text-foreground mt-0.5">
              {summary.activeJobs} of {summary.totalJobs}
            </p>
          </div>
          <Briefcase className="h-8 w-8 text-indigo-500/20" />
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Last Order Date</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">
              {formatDate(summary.lastOrderDate, 'No orders yet')}
            </p>
          </div>
          <Clock className="h-8 w-8 text-amber-500/20" />
        </div>
      </div>

      {/* Main Grid: Left Details & Notes, Right Tabbed Customer Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Contact & Internal Notes Column (4/12 Width) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Profile Card */}
          <div className="rounded-lg border bg-card p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold tracking-tight text-foreground border-b pb-2">
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
                  <p className="font-semibold text-foreground">{customer.mobile || '—'}</p>
                  {customer.alternateMobile && <p className="text-muted-foreground">Alt: {customer.alternateMobile}</p>}
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
                  <p className="text-foreground whitespace-pre-line">{customer.address || 'Unspecified'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 border-t pt-2">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-muted-foreground">Customer Since</p>
                  <p className="font-semibold text-foreground">{formatDate(customer.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Internal Operational Notes Card */}
          <div className="rounded-lg border bg-card p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                Internal Operational Notes
              </h3>
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xs text-foreground whitespace-pre-line bg-muted/20 p-3 rounded-md border min-h-20">
              {customer.notes || 'No internal operational notes recorded.'}
            </p>
          </div>
        </div>

        {/* Customer 360 Embedded Tabbed Workspace (8/12 Width) */}
        <div className="space-y-4 lg:col-span-8">
          {/* Tab Navigation Header */}
          <div className="flex items-center space-x-2 border-b pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('JOBS')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'JOBS'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Jobs & Orders ({jobs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('INVOICES')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'INVOICES'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Invoices ({invoices.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PAYMENTS')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'PAYMENTS'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Payments ({payments.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('TIMELINE')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'TIMELINE'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span>Timeline ({timeline.length})</span>
            </button>
          </div>

          {/* Jobs Tab View */}
          {activeTab === 'JOBS' && (
            <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
              {jobs.length === 0 ? (
                <p className="p-5 text-xs text-muted-foreground italic">No job orders found for this customer.</p>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-muted/40 font-semibold text-muted-foreground uppercase">
                    <tr>
                      <th className="px-4 py-2.5">Job No</th>
                      <th className="px-4 py-2.5">Priority</th>
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-mono font-bold text-foreground">{job.jobNo}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded px-2 py-0.5 text-[10px] font-semibold uppercase bg-blue-100 text-blue-800">
                            {job.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(job.jobDate)}</td>
                        <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                        <td className="px-4 py-3 text-right">
                          <Link to={ROUTES.JOBS.DETAIL(job.id)} className="text-primary hover:underline font-semibold">
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
            <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
              {invoices.length === 0 ? (
                <p className="p-5 text-xs text-muted-foreground italic">No invoices issued for this customer.</p>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-muted/40 font-semibold text-muted-foreground uppercase">
                    <tr>
                      <th className="px-4 py-2.5">Invoice No</th>
                      <th className="px-4 py-2.5">Issue Date</th>
                      <th className="px-4 py-2.5 text-right">Grand Total</th>
                      <th className="px-4 py-2.5 text-right">Balance Due</th>
                      <th className="px-4 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-mono font-bold text-foreground">
                          <Link to={ROUTES.INVOICES.DETAIL(inv.id)} className="hover:underline">
                            {inv.invoiceNo}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(inv.invoiceDate)}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-foreground">{formatCurrency(inv.grandTotal)}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">{formatCurrency(inv.outstandingBalance)}</td>
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
            <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
              {payments.length === 0 ? (
                <p className="p-5 text-xs text-muted-foreground italic">No confirmed payments recorded for this customer.</p>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-muted/40 font-semibold text-muted-foreground uppercase">
                    <tr>
                      <th className="px-4 py-2.5">Payment No</th>
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5">Method</th>
                      <th className="px-4 py-2.5">Reference</th>
                      <th className="px-4 py-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-mono font-bold text-foreground">{pay.paymentNo}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(pay.paymentDate)}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">{pay.paymentMethod}</td>
                        <td className="px-4 py-3 text-muted-foreground">{pay.referenceNo || 'N/A'}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(pay.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Activity Timeline Stream Tab View */}
          {activeTab === 'TIMELINE' && (
            <div className="rounded-lg border bg-card p-5 shadow-sm">
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {timeline.map((act) => (
                  <div key={act.id} className="relative flex items-start justify-between text-xs">
                    <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-card border shadow-xs">
                      {act.type === 'JOB' ? <Briefcase className="h-3 w-3 text-blue-500" /> : act.type === 'INVOICE' ? <FileText className="h-3 w-3 text-purple-500" /> : <CreditCard className="h-3 w-3 text-emerald-500" />}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{act.title}</p>
                      <p className="text-muted-foreground">{act.description}</p>
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground shrink-0 ml-2">{formatDate(act.timestamp)}</span>
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

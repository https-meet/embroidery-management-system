import React, { useState } from 'react';
import { BarChart3, Users, Briefcase, Layers, CreditCard } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { PaginationBar } from '@/shared/components/PaginationBar';
import { usePagination } from '@/shared/hooks/usePagination';
import { ErrorState } from '@/shared/components/ErrorState';
import {
  useCustomerReport,
  useJobReport,
  usePaymentReport,
  useProductionReport,
  useRevenueReport,
} from '../hooks/useReports';
import { ReportDateFilter } from '../components/ReportDateFilter';
import { RevenueSummaryCards } from '../components/RevenueSummaryCards';
import { RevenueMethodChart } from '../components/RevenueMethodChart';
import { CustomerReportTable } from '../components/CustomerReportTable';
import { JobReportTable } from '../components/JobReportTable';
import { ProductionReportTable } from '../components/ProductionReportTable';
import { PaymentReportTable } from '../components/PaymentReportTable';
import { ExportCsvButton } from '../components/ExportCsvButton';
import { SystemBackupCard } from '../components/SystemBackupCard';

type ReportTab = 'revenue' | 'customers' | 'jobs' | 'production' | 'payments';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('revenue');
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  const { page, limit, setPage, setLimit } = usePagination();

  const handleDateChange = (start?: string, end?: string) => {
    setStartDate(start);
    setEndDate(end);
    setPage(1);
  };

  const handleReset = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
  };

  const filterParams = {
    startDate,
    endDate,
    page,
    limit,
  };

  // Queries for active tabs
  const revenueQuery = useRevenueReport({ startDate, endDate });
  const customerQuery = useCustomerReport(activeTab === 'customers' ? filterParams : undefined);
  const jobQuery = useJobReport(activeTab === 'jobs' ? filterParams : undefined);
  const productionQuery = useProductionReport(activeTab === 'production' ? filterParams : undefined);
  const paymentQuery = usePaymentReport(activeTab === 'payments' ? filterParams : undefined);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operational & Financial Reports"
        description="Comprehensive analytics on revenue trends, customer performance, job flow, and machine production."
      />

      {/* System Backup Hub Card */}
      <SystemBackupCard />

      {/* Date Range Filter Bar */}
      <ReportDateFilter
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
        onReset={handleReset}
      />

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-border pb-2 gap-2 select-none">
        <div className="flex flex-wrap items-center space-x-1">
          <TabButton
            active={activeTab === 'revenue'}
            onClick={() => setActiveTab('revenue')}
            icon={<BarChart3 className="h-3.5 w-3.5" />}
            label="Revenue Analytics"
          />
          <TabButton
            active={activeTab === 'customers'}
            onClick={() => setActiveTab('customers')}
            icon={<Users className="h-3.5 w-3.5" />}
            label="Customer Performance"
          />
          <TabButton
            active={activeTab === 'jobs'}
            onClick={() => setActiveTab('jobs')}
            icon={<Briefcase className="h-3.5 w-3.5" />}
            label="Job Volume"
          />
          <TabButton
            active={activeTab === 'production'}
            onClick={() => setActiveTab('production')}
            icon={<Layers className="h-3.5 w-3.5" />}
            label="Machine Production"
          />
          <TabButton
            active={activeTab === 'payments'}
            onClick={() => setActiveTab('payments')}
            icon={<CreditCard className="h-3.5 w-3.5" />}
            label="Payment Audit"
          />
        </div>

        {/* CSV Export Button */}
        <div>
          {activeTab === 'revenue' && (
            <ExportCsvButton
              filename="revenue_summary_report"
              data={
                revenueQuery.data
                  ? [
                      {
                        'Metric / Method': 'Total Invoiced Amount (₹)',
                        'Value / Amount (₹)': revenueQuery.data.totalInvoiced,
                      },
                      {
                        'Metric / Method': 'Total Payments Collected (₹)',
                        'Value / Amount (₹)': revenueQuery.data.totalCollected,
                      },
                      {
                        'Metric / Method': 'Total Outstanding Balance (₹)',
                        'Value / Amount (₹)': revenueQuery.data.totalOutstanding,
                      },
                      ...(revenueQuery.data.byPaymentMethod || []).map((m) => ({
                        'Metric / Method': `Collected via ${m.method}`,
                        'Value / Amount (₹)': m.total,
                      })),
                    ]
                  : []
              }
            />
          )}
          {activeTab === 'customers' && (
            <ExportCsvButton
              filename="customer_performance_report"
              data={(customerQuery.data?.items || []).map((c) => ({
                'Customer Code': c.customerCode,
                'Customer Name': c.name,
                'Type': c.customerType,
                'Total Orders': c.totalJobs,
                'Total Invoiced (₹)': c.totalInvoiced,
                'Total Paid (₹)': c.totalPaid,
                'Outstanding Balance (₹)': c.outstandingBalance,
              }))}
            />
          )}
          {activeTab === 'jobs' && (
            <ExportCsvButton
              filename="job_volume_report"
              data={(jobQuery.data?.items || []).map((j) => ({
                'Job No': j.jobNo,
                'Customer Name': j.customerName,
                'Order Date': new Date(j.jobDate).toLocaleDateString(),
                'Status': j.status,
                'Priority': j.priority,
                'Total Amount (₹)': j.totalAmount,
              }))}
            />
          )}
          {activeTab === 'production' && (
            <ExportCsvButton
              filename="production_queue_report"
              data={(productionQuery.data?.items || []).map((p) => ({
                'Job No': p.jobNo,
                'Customer Name': p.customerName,
                'Assigned Operator': p.assignedOperator || 'Unassigned',
                'Status': p.status,
                'Started At': p.startedAt ? new Date(p.startedAt).toLocaleString() : 'Not Started',
                'Completed At': p.completedAt ? new Date(p.completedAt).toLocaleString() : 'In Progress',
                'Total Line Items': p.itemCount,
              }))}
            />
          )}
          {activeTab === 'payments' && (
            <ExportCsvButton
              filename="payment_audit_report"
              data={(paymentQuery.data?.items || []).map((p) => ({
                'Payment No': p.paymentNo,
                'Customer Name': p.customerName,
                'Payment Date': new Date(p.paymentDate).toLocaleDateString(),
                'Payment Method': p.paymentMethod,
                'Reference No': p.referenceNo || 'N/A',
                'Amount Received (₹)': p.amount,
              }))}
            />
          )}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {revenueQuery.isError ? (
            <ErrorState
              title="Failed to load revenue report"
              onRetry={() => revenueQuery.refetch()}
            />
          ) : (
            <>
              <RevenueSummaryCards data={revenueQuery.data} />
              <RevenueMethodChart byPaymentMethod={revenueQuery.data?.byPaymentMethod} />
            </>
          )}
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="space-y-4">
          {customerQuery.isError ? (
            <ErrorState
              title="Failed to load customer report"
              onRetry={() => customerQuery.refetch()}
            />
          ) : (
            <>
              <CustomerReportTable
                items={customerQuery.data?.items || []}
                isLoading={customerQuery.isLoading}
              />
              {customerQuery.data && (
                <PaginationBar
                  currentPage={customerQuery.data.page}
                  totalPages={customerQuery.data.totalPages}
                  totalItems={customerQuery.data.total}
                  pageSize={customerQuery.data.limit}
                  onPageChange={setPage}
                  onPageSizeChange={setLimit}
                />
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {jobQuery.isError ? (
            <ErrorState
              title="Failed to load job report"
              onRetry={() => jobQuery.refetch()}
            />
          ) : (
            <>
              <JobReportTable
                items={jobQuery.data?.items || []}
                isLoading={jobQuery.isLoading}
              />
              {jobQuery.data && (
                <PaginationBar
                  currentPage={jobQuery.data.page}
                  totalPages={jobQuery.data.totalPages}
                  totalItems={jobQuery.data.total}
                  pageSize={jobQuery.data.limit}
                  onPageChange={setPage}
                  onPageSizeChange={setLimit}
                />
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'production' && (
        <div className="space-y-4">
          {productionQuery.isError ? (
            <ErrorState
              title="Failed to load production report"
              onRetry={() => productionQuery.refetch()}
            />
          ) : (
            <>
              <ProductionReportTable
                items={productionQuery.data?.items || []}
                isLoading={productionQuery.isLoading}
              />
              {productionQuery.data && (
                <PaginationBar
                  currentPage={productionQuery.data.page}
                  totalPages={productionQuery.data.totalPages}
                  totalItems={productionQuery.data.total}
                  pageSize={productionQuery.data.limit}
                  onPageChange={setPage}
                  onPageSizeChange={setLimit}
                />
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-4">
          {paymentQuery.isError ? (
            <ErrorState
              title="Failed to load payment report"
              onRetry={() => paymentQuery.refetch()}
            />
          ) : (
            <>
              <PaymentReportTable
                items={paymentQuery.data?.items || []}
                isLoading={paymentQuery.isLoading}
              />
              {paymentQuery.data && (
                <PaginationBar
                  currentPage={paymentQuery.data.page}
                  totalPages={paymentQuery.data.totalPages}
                  totalItems={paymentQuery.data.total}
                  pageSize={paymentQuery.data.limit}
                  onPageChange={setPage}
                  onPageSizeChange={setLimit}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 ${
      active
        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

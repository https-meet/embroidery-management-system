import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { useSetBreadcrumb } from '@/shared/context/BreadcrumbContext';
import { ROUTES } from '@/shared/constants/routes';
import { axiosClient } from '@/shared/api';

export const DeliveryChallanPrintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useSetBreadcrumb(id, job?.jobNo);


  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const [jobRes, setRes]: [any, any] = await Promise.all([
          axiosClient.get(`/jobs/${id}`),
          axiosClient.get('/settings/business'),
        ]);
        setJob(jobRes.data?.job || jobRes.data);
        setSettings(setRes.data?.config || setRes.data?.settings || setRes.data);
      } catch {
        toast.error('Failed to load job details or business settings.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm font-medium text-muted-foreground">
        Preparing Delivery Challan Print View...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Job record not found.</p>
        <Button size="sm" onClick={() => navigate(ROUTES.JOBS.LIST)}>Back to Jobs</Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const company = settings || {
    companyName: 'EBMS Embroidery Works',
    address: 'Plot 102, Industrial Estate, Textile Market',
    city: 'Surat',
    state: 'Gujarat',
    phone: '+91 98250 12345',
  };

  const customer = job.customer || {};
  const items = job.items || [];
  const challanNo = `DN-${job.jobNo ? job.jobNo.replace(/^JOB-/, '') : '2026-000001'}`;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 sm:p-8">
      {/* Action Bar */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.JOBS.DETAIL(job.id))}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Job Details
        </Button>
        <Button size="sm" onClick={handlePrint} className="bg-slate-900 hover:bg-slate-800 text-white">
          <Printer className="mr-1.5 h-4 w-4" /> Print Delivery Challan (A4)
        </Button>
      </div>

      {/* Printable A4 Paper Document Container */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 p-8 rounded-lg shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none font-sans text-xs">
        {/* Header Branding */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">{company.companyName}</h1>
            <p className="text-slate-600">{company.address}, {company.city}, {company.state}</p>
            <p className="text-slate-600">Phone: {company.phone}</p>
          </div>
          <div className="text-right space-y-1">
            <div className="inline-block px-3 py-1 bg-slate-900 text-white font-bold tracking-widest text-sm rounded">
              DELIVERY CHALLAN
            </div>
            <div className="text-xs font-mono font-bold text-slate-900 pt-1">Challan No: {challanNo}</div>
            <div className="text-slate-600">Date: {new Date().toLocaleDateString()}</div>
            <div className="text-slate-600">Job Reference: <span className="font-mono font-bold text-slate-900">{job.jobNo}</span></div>
          </div>
        </div>

        {/* Customer Delivery Details */}
        <div className="border border-slate-300 rounded p-3 mb-6 bg-slate-50">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Delivery Destination:</span>
          <div className="font-bold text-slate-900 text-sm">{customer.name || 'Customer'}</div>
          {customer.address && <div className="text-slate-600">{customer.address}</div>}
          {customer.phone && <div className="text-slate-600">Contact Phone: {customer.phone}</div>}
        </div>

        {/* Goods Particulars Table (NO PRICES DISPLAYED) */}
        <table className="w-full border-collapse border border-slate-300 mb-8 text-left">
          <thead>
            <tr className="bg-slate-900 text-white font-semibold text-[11px]">
              <th className="border border-slate-400 px-3 py-2 text-center w-12">#</th>
              <th className="border border-slate-400 px-3 py-2">Garment Type / Particulars</th>
              <th className="border border-slate-400 px-3 py-2">Position / Details</th>
              <th className="border border-slate-400 px-3 py-2">Design Code</th>
              <th className="border border-slate-400 px-3 py-2 text-right">Quantity (Pcs)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, index: number) => (
              <tr key={index} className="border-b border-slate-200">
                <td className="border border-slate-300 px-3 py-2 text-center font-mono">{index + 1}</td>
                <td className="border border-slate-300 px-3 py-2 font-bold text-slate-900">{item.garmentType || 'Garment Work'}</td>
                <td className="border border-slate-300 px-3 py-2 text-slate-700">{item.position || 'Chest / Back'}</td>
                <td className="border border-slate-300 px-3 py-2 font-mono text-slate-800">{item.design?.designCode || '—'}</td>
                <td className="border border-slate-300 px-3 py-2 text-right font-mono font-bold text-sm">{item.quantity || 1}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Remarks Box */}
        <div className="border border-slate-300 rounded p-3 mb-12">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Delivery Instructions / Remarks:</span>
          <p className="text-slate-600 pt-1">{job.remarks || 'Garments processed and checked in good condition. Please inspect upon receipt.'}</p>
        </div>

        {/* Dual Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300">
          <div className="space-y-12">
            <div className="text-slate-500 border-t border-slate-400 inline-block pt-1 px-8 text-xs font-semibold">
              Receiver's Signature & Stamp
            </div>
          </div>
          <div className="text-right space-y-12">
            <div className="text-slate-500 border-t border-slate-400 inline-block pt-1 px-8 text-xs font-semibold">
              Authorized Dispatcher Signature
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

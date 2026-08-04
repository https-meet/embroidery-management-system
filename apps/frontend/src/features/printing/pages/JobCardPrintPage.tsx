import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/constants/routes';
import { axiosClient } from '@/shared/api';

export const JobCardPrintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const [jobRes, setRes]: [any, any] = await Promise.all([
          axiosClient.get(`/jobs/${id}`),
          axiosClient.get('/settings'),
        ]);
        setJob(jobRes.data?.job || jobRes.data);
        setSettings(setRes.data?.settings || setRes.data);
      } catch {
        toast.error('Failed to load job ticket details.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm font-medium text-muted-foreground">
        Preparing Shop Floor Job Card Print View...
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

  const company = settings || { companyName: 'EBMS Embroidery Factory' };
  const items = job.items || [];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 sm:p-8">
      {/* Action Bar */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.JOBS.DETAIL(job.id))}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Job Details
        </Button>
        <Button size="sm" onClick={handlePrint} className="bg-amber-600 hover:bg-amber-700 text-white">
          <Printer className="mr-1.5 h-4 w-4" /> Print Shop Floor Job Ticket (A4)
        </Button>
      </div>

      {/* Printable A4 Document */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 p-8 rounded-lg shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none font-sans text-xs">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3 mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-500">{company.companyName}</span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">PRODUCTION WORK ORDER / JOB CARD</h1>
          </div>
          <div className="text-right flex items-center space-x-4">
            {/* QR Placeholder Area */}
            <div className="border border-slate-400 p-1.5 rounded flex flex-col items-center justify-center bg-slate-50">
              <QrCode className="h-10 w-10 text-slate-800" />
              <span className="text-[9px] font-mono text-slate-600 font-bold">{job.jobNo}</span>
            </div>
            <div>
              <div className="text-lg font-mono font-bold text-slate-900">{job.jobNo}</div>
              <div className="text-xs font-bold uppercase text-amber-700">Priority: {job.priority || 'NORMAL'}</div>
              <div className="text-xs text-slate-600">Due Date: <span className="font-bold text-slate-900">{job.deliveryDate ? new Date(job.deliveryDate).toLocaleDateString() : 'ASAP'}</span></div>
            </div>
          </div>
        </div>

        {/* Customer & Machine Info Grid */}
        <div className="grid grid-cols-3 gap-4 border border-slate-300 rounded p-3 mb-4 bg-slate-50">
          <div>
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Customer:</span>
            <div className="font-bold text-slate-900 text-sm">{job.customer?.name || 'Customer'}</div>
          </div>
          <div>
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Assigned Operator:</span>
            <div className="font-bold text-slate-900">{job.assignedTo || 'Shop Floor Queue'}</div>
          </div>
          <div>
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Current Status:</span>
            <div className="font-bold uppercase text-emerald-800">{job.status || 'PENDING'}</div>
          </div>
        </div>

        {/* Job Items & Production Specs */}
        <div className="space-y-4 mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
            Design & Stitch Specifications
          </h2>
          {items.map((item: any, idx: number) => (
            <div key={idx} className="border border-slate-300 rounded p-4 space-y-3 bg-white">
              <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Item #{idx + 1}</span>
                  <h3 className="font-bold text-slate-900 text-sm">{item.garmentType || 'Garment'} — {item.position || 'Chest'}</h3>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px]">Quantity:</span>
                  <div className="text-base font-bold font-mono text-slate-900">{item.quantity} Pcs</div>
                </div>
              </div>

              {/* Design Meta */}
              {item.design ? (
                <div className="grid grid-cols-4 gap-3 bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px]">Design Code</span>
                    <div className="font-mono font-bold text-slate-900">{item.design.designCode}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Stitch Count</span>
                    <div className="font-mono font-bold text-slate-900">{item.design.stitchCount?.toLocaleString() || '—'}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Dimensions (W x H)</span>
                    <div className="font-mono font-bold text-slate-900">{item.design.widthMm || '—'}mm x {item.design.heightMm || '—'}mm</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Thread Colors</span>
                    <div className="font-mono font-bold text-slate-900">{item.design.colorCount || '—'} Colors</div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No design catalog attached to this item.</p>
              )}
            </div>
          ))}
        </div>

        {/* Machine Operator Instructions & Checklist */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="border border-slate-300 rounded p-3 space-y-2">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Operator Production Notes:</span>
            <p className="text-slate-600 text-xs min-h-[60px]">{job.remarks || 'Ensure correct thread tensions. Inspect first sample piece before full run.'}</p>
          </div>

          <div className="border border-slate-300 rounded p-3 space-y-1 text-[11px]">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">QC Checklist:</span>
            <div className="space-y-1 text-slate-700 pt-1">
              <label className="flex items-center space-x-2"><input type="checkbox" className="h-3 w-3" /> <span>Thread colors match approved spec sheet</span></label>
              <label className="flex items-center space-x-2"><input type="checkbox" className="h-3 w-3" /> <span>Backing type & stabilizer correctly applied</span></label>
              <label className="flex items-center space-x-2"><input type="checkbox" className="h-3 w-3" /> <span>Stitch density & trimming inspected</span></label>
              <label className="flex items-center space-x-2"><input type="checkbox" className="h-3 w-3" /> <span>Garment count verified before packing</span></label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end border-t border-slate-300 pt-6">
          <div className="text-[10px] text-slate-500">
            EBMS Production Module | Ticket Created: {new Date(job.createdAt || Date.now()).toLocaleString()}
          </div>
          <div className="text-right space-y-8">
            <div className="text-slate-500 border-t border-slate-400 inline-block pt-1 px-8 text-xs font-semibold">
              Machine Master / Operator Signature
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

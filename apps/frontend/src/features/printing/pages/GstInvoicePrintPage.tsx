import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/constants/routes';
import { axiosClient } from '@/shared/api';
import { numberToWordsRupees } from '@/shared/utils/amountInWords';

export const GstInvoicePrintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const [invRes, setRes]: [any, any] = await Promise.all([
          axiosClient.get(`/invoices/${id}`),
          axiosClient.get('/settings'),
        ]);
        setInvoice(invRes.data?.invoice || invRes.data);
        setSettings(setRes.data?.settings || setRes.data);
      } catch {
        toast.error('Failed to load invoice or business settings.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm font-medium text-muted-foreground">
        Preparing GST Tax Invoice Print View...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Invoice not found.</p>
        <Button size="sm" onClick={() => navigate(ROUTES.INVOICES.LIST)}>Back to Invoices</Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const company = settings || {
    companyName: 'EBMS Embroidery Works',
    gstin: '24AAAAA0000A1Z5',
    address: 'Plot 102, Industrial Estate, Textile Market',
    city: 'Surat',
    state: 'Gujarat',
    postalCode: '395002',
    phone: '+91 98250 12345',
    email: 'billing@ebms-embroidery.com',
    bankName: 'HDFC Bank Ltd',
    accountNumber: '50200012345678',
    ifscCode: 'HDFC0000123',
    upiId: 'ebms@hdfcbank',
  };

  const customer = invoice.customer || {};
  const items = invoice.items || invoice.job?.items || [];
  const subtotal = Number(invoice.subtotal || invoice.amount || 0);
  const discount = Number(invoice.discount || 0);
  const tax = Number(invoice.tax || 0);
  const cgst = tax / 2;
  const sgst = tax / 2;
  const total = Number(invoice.totalAmount || invoice.total || subtotal - discount + tax);
  const amountInWords = numberToWordsRupees(total);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 sm:p-8">
      {/* Action Bar (Hidden during print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.INVOICES.DETAIL(invoice.id))}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Invoice
        </Button>
        <Button size="sm" onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Printer className="mr-1.5 h-4 w-4" /> Print GST Invoice (A4)
        </Button>
      </div>

      {/* Printable A4 Paper Document Container */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 p-8 rounded-lg shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none font-sans text-xs">
        {/* Header Branding */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">{company.companyName}</h1>
            <p className="text-slate-600 leading-tight">
              {company.address}, {company.city}, {company.state} {company.postalCode}
            </p>
            <p className="text-slate-600">Phone: {company.phone} | Email: {company.email}</p>
            <p className="font-mono font-bold text-slate-900 text-xs">GSTIN: {company.gstin}</p>
          </div>
          <div className="text-right space-y-1">
            <div className="inline-block px-3 py-1 bg-slate-900 text-white font-bold tracking-widest text-sm rounded">
              TAX INVOICE
            </div>
            <div className="text-xs font-mono font-bold text-slate-900 pt-1">No: {invoice.invoiceNo || invoice.invoiceNumber}</div>
            <div className="text-slate-600">Date: {new Date(invoice.createdAt || invoice.invoiceDate || Date.now()).toLocaleDateString()}</div>
            <div className="text-slate-600">HSN/SAC Code: <span className="font-mono font-semibold">998821 (Embroidery)</span></div>
          </div>
        </div>

        {/* Bill To Customer Section */}
        <div className="grid grid-cols-2 gap-4 border border-slate-300 rounded p-3 mb-4 bg-slate-50">
          <div>
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Billed To:</span>
            <div className="font-bold text-slate-900 text-sm">{customer.name || 'Walk-in Customer'}</div>
            {customer.address && <div className="text-slate-600">{customer.address}</div>}
            {customer.phone && <div className="text-slate-600">Phone: {customer.phone}</div>}
            {customer.gstin && <div className="font-mono font-semibold text-slate-900">GSTIN: {customer.gstin}</div>}
          </div>
          <div className="text-right space-y-1">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Job Reference:</span>
            <div className="font-mono font-bold text-slate-900">{invoice.job?.jobNo || invoice.jobNo || 'Direct Invoice'}</div>
            <div className="text-slate-600">Payment Status: <span className="font-bold uppercase text-emerald-700">{invoice.status || 'ISSUED'}</span></div>
          </div>
        </div>

        {/* Particulars Table */}
        <table className="w-full border-collapse border border-slate-300 mb-4 text-left">
          <thead>
            <tr className="bg-slate-900 text-white font-semibold text-[11px]">
              <th className="border border-slate-400 px-3 py-2 text-center w-12">#</th>
              <th className="border border-slate-400 px-3 py-2">Item Description & Design</th>
              <th className="border border-slate-400 px-3 py-2 text-right">Stitches</th>
              <th className="border border-slate-400 px-3 py-2 text-right">Qty</th>
              <th className="border border-slate-400 px-3 py-2 text-right">Rate (₹)</th>
              <th className="border border-slate-400 px-3 py-2 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="border border-slate-300 px-3 py-4 text-center text-slate-500">
                  Embroidery Job Services Rendered
                </td>
              </tr>
            ) : (
              items.map((item: any, index: number) => (
                <tr key={index} className="border-b border-slate-200">
                  <td className="border border-slate-300 px-3 py-2 text-center font-mono">{index + 1}</td>
                  <td className="border border-slate-300 px-3 py-2">
                    <div className="font-bold text-slate-900">{item.description || item.garmentType || 'Custom Embroidery Work'}</div>
                    {item.design && <div className="text-slate-600 text-[11px]">Design: {item.design.name} ({item.design.designCode})</div>}
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right font-mono">{item.stitchCount || item.design?.stitchCount || '—'}</td>
                  <td className="border border-slate-300 px-3 py-2 text-right font-mono">{item.quantity || 1}</td>
                  <td className="border border-slate-300 px-3 py-2 text-right font-mono">₹{Number(item.rate || item.unitPrice || 0).toFixed(2)}</td>
                  <td className="border border-slate-300 px-3 py-2 text-right font-mono font-bold">₹{Number(item.amount || item.lineTotal || (item.quantity || 1) * (item.rate || 0)).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Summary Breakdown */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Left Side: Bank Details & Amount in Words */}
          <div className="space-y-3">
            <div className="border border-slate-300 rounded p-2.5 bg-slate-50">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Bank Transfer & UPI Details:</span>
              <div className="text-slate-800 text-[11px] pt-1">
                <div><strong>Bank Name:</strong> {company.bankName}</div>
                <div><strong>A/C No:</strong> {company.accountNumber}</div>
                <div><strong>IFSC Code:</strong> {company.ifscCode}</div>
                {company.upiId && <div><strong>UPI ID:</strong> {company.upiId}</div>}
              </div>
            </div>

            <div className="border border-slate-300 rounded p-2.5">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Amount in Words:</span>
              <div className="font-bold text-slate-900 text-xs italic pt-1">{amountInWords}</div>
            </div>
          </div>

          {/* Right Side: Tax Calculation Totals */}
          <div className="border border-slate-300 rounded p-3 space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Amount:</span>
              <span className="font-bold text-slate-900">₹{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Discount:</span>
                <span className="font-bold text-slate-900">-₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-1">
              <span>CGST @ 9%:</span>
              <span>₹{cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>SGST @ 9%:</span>
              <span>₹{sgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold text-sm border-t-2 border-slate-900 pt-2">
              <span>Grand Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer & Signatures */}
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-300 items-end">
          <div className="text-[10px] text-slate-500 space-y-1">
            <p>1. Goods once processed or delivered cannot be returned.</p>
            <p>2. Subject to local city jurisdiction only.</p>
            <p>3. This is a computer generated GST Tax Invoice.</p>
          </div>
          <div className="text-right space-y-8">
            <div className="font-bold text-slate-900">For {company.companyName}</div>
            <div className="text-slate-500 border-t border-slate-400 inline-block pt-1 px-8 text-[11px]">
              Authorized Signatory
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

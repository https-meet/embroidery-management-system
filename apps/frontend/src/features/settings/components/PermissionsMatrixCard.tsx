import React from 'react';
import { Users, CheckCircle2, XCircle } from 'lucide-react';

export const PermissionsMatrixCard: React.FC = () => {
  const capabilities = [
    { name: 'View Operational Dashboard', operator: true, manager: true, accountant: true, admin: true },
    { name: 'Create & Edit Customers', operator: true, manager: true, accountant: true, admin: true },
    { name: 'Archive Customers', operator: false, manager: false, accountant: false, admin: true },
    { name: 'Create & Manage Job Orders', operator: true, manager: true, accountant: true, admin: true },
    { name: 'Start Production & Assign Machine', operator: true, manager: true, accountant: false, admin: true },
    { name: 'Record Quality Check (QC)', operator: true, manager: true, accountant: false, admin: true },
    { name: 'Issue Tax Invoices', operator: false, manager: true, accountant: true, admin: true },
    { name: 'Cancel Invoices', operator: false, manager: false, accountant: false, admin: true },
    { name: 'Record Payment Receipts', operator: false, manager: true, accountant: true, admin: true },
    { name: 'View Revenue Reports & Financials', operator: false, manager: false, accountant: true, admin: true },
    { name: 'Download Full Database Backups', operator: false, manager: false, accountant: false, admin: true },
    { name: 'Modify System & Firm Settings', operator: false, manager: false, accountant: false, admin: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 border-b pb-3">
        <Users className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-base font-bold text-foreground">User Roles & Capability Permissions Matrix</h3>
          <p className="text-xs text-muted-foreground">
            Fine-grained capability permission matrix defining operational authority across system roles.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b bg-muted/40 font-semibold text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3">System Feature / Capability</th>
              <th className="px-4 py-3 text-center">OPERATOR</th>
              <th className="px-4 py-3 text-center">MANAGER</th>
              <th className="px-4 py-3 text-center">ACCOUNTANT</th>
              <th className="px-4 py-3 text-center">ADMINISTRATOR</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {capabilities.map((cap) => (
              <tr key={cap.name} className="hover:bg-muted/20">
                <td className="px-4 py-2.5 font-medium text-foreground">{cap.name}</td>
                <td className="px-4 py-2.5 text-center">
                  {cap.operator ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /> : <XCircle className="h-4 w-4 text-muted-foreground/40 mx-auto" />}
                </td>
                <td className="px-4 py-2.5 text-center">
                  {cap.manager ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /> : <XCircle className="h-4 w-4 text-muted-foreground/40 mx-auto" />}
                </td>
                <td className="px-4 py-2.5 text-center">
                  {cap.accountant ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /> : <XCircle className="h-4 w-4 text-muted-foreground/40 mx-auto" />}
                </td>
                <td className="px-4 py-2.5 text-center">
                  {cap.admin ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /> : <XCircle className="h-4 w-4 text-muted-foreground/40 mx-auto" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

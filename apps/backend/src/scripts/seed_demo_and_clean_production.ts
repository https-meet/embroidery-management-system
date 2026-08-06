process.env.PRODUCTION_DATABASE_URL = 'postgresql://postgres:postgres123@localhost:5432/ebms_production?schema=public';
process.env.DEMO_DATABASE_URL = 'postgresql://postgres:postgres123@localhost:5432/ebms_demo?schema=public';

import { productionPrisma, demoPrisma } from '../lib/database';
import { passwordService } from '../modules/auth/password.service';
import { CustomerType, Priority, JobStatus, JobItemProductionStatus, InvoiceStatus, PaymentStatus, PaymentMethod, MaterialCategory, MaterialUnit, Role } from '@prisma/client';

async function main() {
  console.log('=== STARTING SEED & CLEANUP PROCEDURE ===\n');

  const prodHash = await passwordService.hash('Chauhan@2025');
  const demoHash = await passwordService.hash('Demo@2026!');

  // ==========================================
  // 1. CLEAN & RESET PRODUCTION DB (ebms_production)
  // ==========================================
  console.log('🧹 1. Cleaning Production Database (ebms_production)...');

  await productionPrisma.paymentAllocation.deleteMany();
  await productionPrisma.payment.deleteMany();
  await productionPrisma.invoiceItem.deleteMany();
  await productionPrisma.invoice.deleteMany();
  await productionPrisma.jobItem.deleteMany();
  await productionPrisma.job.deleteMany();
  await productionPrisma.purchaseItem.deleteMany();
  await productionPrisma.purchase.deleteMany();
  await productionPrisma.design.deleteMany();
  await productionPrisma.material.deleteMany();
  await productionPrisma.supplier.deleteMany();
  await productionPrisma.customer.deleteMany();
  await productionPrisma.session.deleteMany();
  await productionPrisma.user.deleteMany();

  // Create clean Production Admin user
  const prodUser = await productionPrisma.user.create({
    data: {
      name: 'Factory Owner (Admin)',
      email: 'chauhan@ebms.com',
      passwordHash: prodHash,
      role: Role.ADMIN,
      isActive: true,
      mustChangePassword: false,
    },
  });

  console.log(`- Created clean Production Admin user: ${prodUser.email}`);
  console.log('✅ Production Database clean and ready for production use.\n');

  // ==========================================
  // 2. SEED DEMO DB (ebms_demo)
  // ==========================================
  console.log('🌱 2. Seeding Demo Database (ebms_demo)...');

  await demoPrisma.paymentAllocation.deleteMany();
  await demoPrisma.payment.deleteMany();
  await demoPrisma.invoiceItem.deleteMany();
  await demoPrisma.invoice.deleteMany();
  await demoPrisma.jobItem.deleteMany();
  await demoPrisma.job.deleteMany();
  await demoPrisma.purchaseItem.deleteMany();
  await demoPrisma.purchase.deleteMany();
  await demoPrisma.design.deleteMany();
  await demoPrisma.material.deleteMany();
  await demoPrisma.supplier.deleteMany();
  await demoPrisma.customer.deleteMany();
  await demoPrisma.session.deleteMany();
  await demoPrisma.user.deleteMany();

  // Create Demo Admin user
  const demoUser = await demoPrisma.user.create({
    data: {
      name: 'Demo Admin User',
      email: 'demo@ebms.com',
      passwordHash: demoHash,
      role: Role.ADMIN,
      isActive: true,
      mustChangePassword: false,
    },
  });

  // Also seed Production user in Demo for convenience
  await demoPrisma.user.create({
    data: {
      name: 'Factory Owner',
      email: 'chauhan@ebms.com',
      passwordHash: prodHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  // Seed Customers
  const c1 = await demoPrisma.customer.create({
    data: {
      customerCode: 'CUS-2026-000001',
      name: 'Royal Garments Pvt Ltd',
      contactPerson: 'Vikram Shah',
      mobile: '9825011223',
      email: 'contact@royalgarments.in',
      customerType: CustomerType.COMMERCIAL,
      address: '102 Industrial Estate, Ring Road, Surat',
    },
  });

  const c2 = await demoPrisma.customer.create({
    data: {
      customerCode: 'CUS-2026-000002',
      name: 'Apex Sports Academy',
      contactPerson: 'Rajesh Patel',
      mobile: '9898033445',
      email: 'info@apexsports.com',
      customerType: CustomerType.COMMERCIAL,
      address: 'Stadium Complex, CG Road, Ahmedabad',
    },
  });

  const c3 = await demoPrisma.customer.create({
    data: {
      customerCode: 'CUS-2026-000003',
      name: 'Elegance Bridal Boutique',
      contactPerson: 'Priya Mehta',
      mobile: '9712955667',
      email: 'priya@elegancebridal.com',
      customerType: CustomerType.INDIVIDUAL,
      address: '7 Satellite Plaza, Ahmedabad',
    },
  });

  console.log(`- Seeded 3 Customers (${c1.name}, ${c2.name}, ${c3.name})`);

  // Seed Designs
  const d1 = await demoPrisma.design.create({
    data: {
      designCode: 'DES-2026-000001',
      name: 'Royal Crown Logo Embroidered',
      category: 'Blazer Crest',
      stitchCount: 14500,
      widthMm: 75,
      heightMm: 90,
      colorCount: 4,
    },
  });

  const d2 = await demoPrisma.design.create({
    data: {
      designCode: 'DES-2026-000002',
      name: 'Apex Eagle Sports Emblem',
      category: 'T-Shirt Pocket',
      stitchCount: 9800,
      widthMm: 60,
      heightMm: 60,
      colorCount: 3,
    },
  });

  console.log(`- Seeded 2 Designs (${d1.name}, ${d2.name})`);

  // Seed Materials
  const m1 = await demoPrisma.material.create({
    data: {
      name: 'Gold Metallic Thread #40',
      sku: 'THR-GLD-40',
      category: MaterialCategory.THREAD,
      unit: MaterialUnit.CONE,
      currentStock: 45,
      minimumStock: 10,
      purchasePrice: 250,
      sellingPrice: 350,
    },
  });

  const m2 = await demoPrisma.material.create({
    data: {
      name: 'Heavy Duty Non-Woven Backing',
      sku: 'BCK-HVY-80',
      category: MaterialCategory.BACKING,
      unit: MaterialUnit.ROLL,
      currentStock: 12,
      minimumStock: 5,
      purchasePrice: 800,
      sellingPrice: 1100,
    },
  });

  console.log(`- Seeded 2 Materials (${m1.name}, ${m2.name})`);

  // Seed Suppliers
  const s1 = await demoPrisma.supplier.create({
    data: {
      name: 'ThreadCraft India Industries',
      contactPerson: 'Anand Kumar',
      phone: '9879011122',
      email: 'sales@threadcraft.in',
      city: 'Surat',
      state: 'Gujarat',
      address: 'Plot 45, Ring Road Industrial Area',
    },
  });

  console.log(`- Seeded Supplier (${s1.name})`);

  // Seed Jobs
  const job1 = await demoPrisma.job.create({
    data: {
      jobNo: 'JOB-2026-000001',
      customerId: c1.id,
      priority: Priority.HIGH,
      status: JobStatus.IN_PROGRESS,
      assignedOperator: 'Ramesh Sharma',
      expectedDeliveryDate: new Date(Date.now() + 86400000 * 2),
      startedAt: new Date(),
      createdBy: demoUser.id,
      items: {
        create: [
          {
            position: 'Left Chest',
            quantity: 50,
            rate: 65,
            lineTotal: 3250,
            designId: d1.id,
            productionStatus: JobItemProductionStatus.EMBROIDERING,
          },
        ],
      },
    },
  });

  const job2 = await demoPrisma.job.create({
    data: {
      jobNo: 'JOB-2026-000002',
      customerId: c2.id,
      priority: Priority.URGENT,
      status: JobStatus.COMPLETED,
      assignedOperator: 'Suresh Patel',
      expectedDeliveryDate: new Date(),
      startedAt: new Date(Date.now() - 86400000 * 3),
      completedAt: new Date(),
      qualityCheckedAt: new Date(),
      qualityCheckedBy: 'Demo Admin User',
      createdBy: demoUser.id,
      items: {
        create: [
          {
            position: 'Right Sleeve',
            quantity: 100,
            rate: 45,
            lineTotal: 4500,
            designId: d2.id,
            productionStatus: JobItemProductionStatus.PASSED_QC,
          },
        ],
      },
    },
  });

  console.log(`- Seeded 2 Job Orders (${job1.jobNo}, ${job2.jobNo})`);

  // Seed Invoices
  const inv1 = await demoPrisma.invoice.create({
    data: {
      invoiceNo: 'INV-2026-000001',
      customerId: c2.id,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 86400000 * 7),
      subtotal: 4500,
      grandTotal: 4500,
      totalPaid: 4500,
      outstandingBalance: 0,
      status: InvoiceStatus.PAID,
      items: {
        create: [
          {
            description: 'Embroidery Work for Job JOB-2026-000002 (Apex Eagle Emblem)',
            quantity: 100,
            rate: 45,
            amount: 4500,
            sourceJobId: job2.id,
          },
        ],
      },
    },
  });

  const inv2 = await demoPrisma.invoice.create({
    data: {
      invoiceNo: 'INV-2026-000002',
      customerId: c1.id,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 86400000 * 14),
      subtotal: 3250,
      grandTotal: 3250,
      totalPaid: 1000,
      outstandingBalance: 2250,
      status: InvoiceStatus.PARTIALLY_PAID,
      items: {
        create: [
          {
            description: 'Embroidery Work for Job JOB-2026-000001 (Royal Crown Crest)',
            quantity: 50,
            rate: 65,
            amount: 3250,
            sourceJobId: job1.id,
          },
        ],
      },
    },
  });

  console.log(`- Seeded 2 Invoices (${inv1.invoiceNo}, ${inv2.invoiceNo})`);

  // Seed Payment
  const pay1 = await demoPrisma.payment.create({
    data: {
      paymentNo: 'PAY-2026-000001',
      customerId: c2.id,
      paymentDate: new Date(),
      paymentMethod: PaymentMethod.UPI,
      referenceNo: 'UPI-DEMO-998877',
      amount: 4500,
      status: PaymentStatus.FULLY_ALLOCATED,
      notes: 'Full payment for Apex Sports Invoice INV-2026-000001',
      allocations: {
        create: [
          {
            invoiceId: inv1.id,
            allocatedAmount: 4500,
          },
        ],
      },
    },
  });

  console.log(`- Seeded Payment (${pay1.paymentNo}, Amount: ₹${pay1.amount})`);
  console.log('✅ Demo Database seeded successfully with rich demo data!\n');

  await productionPrisma.$disconnect();
  await demoPrisma.$disconnect();

  console.log('======================================================');
  console.log(' SEED & CLEANUP COMPLETE 🟢');
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('❌ Error executing seed & cleanup script:', err);
  process.exit(1);
});

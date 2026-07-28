import { prisma } from '../../lib/prisma';

export interface BusinessConfigDto {
  companyName: string;
  logoUrl?: string | null;
  gstin?: string | null;
  pan?: string | null;
  address?: string | null;
  mobile?: string | null;
  email?: string | null;
  website?: string | null;
  bankName?: string | null;
  accountNo?: string | null;
  ifscCode?: string | null;
  upiId?: string | null;
  upiQrUrl?: string | null;
  invoiceFooter?: string | null;
  jobPrefix: string;
  invoicePrefix: string;
  paymentPrefix: string;
  defaultTaxRatePercentage: number;
  defaultPaymentTermsDays: number;
}

export interface AuditLogItemDto {
  id: string;
  userId?: string | null;
  userName: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  previousValue?: string | null;
  newValue?: string | null;
  reason?: string | null;
  timestamp: Date;
}

export class SettingsService {
  public async getBusinessConfig(): Promise<BusinessConfigDto> {
    let config = await prisma.businessConfig.findFirst();
    if (!config) {
      config = await prisma.businessConfig.create({
        data: {},
      });
    }
    return {
      companyName: config.companyName,
      logoUrl: config.logoUrl,
      gstin: config.gstin,
      pan: config.pan,
      address: config.address,
      mobile: config.mobile,
      email: config.email,
      website: config.website,
      bankName: config.bankName,
      accountNo: config.accountNo,
      ifscCode: config.ifscCode,
      upiId: config.upiId,
      upiQrUrl: config.upiQrUrl,
      invoiceFooter: config.invoiceFooter,
      jobPrefix: config.jobPrefix,
      invoicePrefix: config.invoicePrefix,
      paymentPrefix: config.paymentPrefix,
      defaultTaxRatePercentage: config.defaultTaxRatePercentage,
      defaultPaymentTermsDays: config.defaultPaymentTermsDays,
    };
  }

  public async updateBusinessConfig(dto: Partial<BusinessConfigDto>): Promise<BusinessConfigDto> {
    const existing = await prisma.businessConfig.findFirst();
    let updated;
    if (existing) {
      updated = await prisma.businessConfig.update({
        where: { id: existing.id },
        data: dto,
      });
    } else {
      updated = await prisma.businessConfig.create({
        data: dto,
      });
    }
    return {
      companyName: updated.companyName,
      logoUrl: updated.logoUrl,
      gstin: updated.gstin,
      pan: updated.pan,
      address: updated.address,
      mobile: updated.mobile,
      email: updated.email,
      website: updated.website,
      bankName: updated.bankName,
      accountNo: updated.accountNo,
      ifscCode: updated.ifscCode,
      upiId: updated.upiId,
      upiQrUrl: updated.upiQrUrl,
      invoiceFooter: updated.invoiceFooter,
      jobPrefix: updated.jobPrefix,
      invoicePrefix: updated.invoicePrefix,
      paymentPrefix: updated.paymentPrefix,
      defaultTaxRatePercentage: updated.defaultTaxRatePercentage,
      defaultPaymentTermsDays: updated.defaultPaymentTermsDays,
    };
  }

  public async getSystemHealth() {
    const startTime = Date.now();
    let dbStatus = 'HEALTHY';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'DEGRADED';
    }
    const latencyMs = Date.now() - startTime;

    const [customerCount, jobCount, invoiceCount, paymentCount, designCount] = await Promise.all([
      prisma.customer.count({ where: { deletedAt: null } }),
      prisma.job.count({ where: { deletedAt: null } }),
      prisma.invoice.count(),
      prisma.payment.count(),
      prisma.design.count({ where: { deletedAt: null } }),
    ]);

    return {
      appVersion: 'v1.0.0-commercial',
      environment: process.env['NODE_ENV'] || 'production',
      database: {
        status: dbStatus,
        latencyMs,
        provider: 'PostgreSQL',
      },
      systemUptimeSeconds: Math.floor(process.uptime()),
      recordCounts: {
        customers: customerCount,
        jobs: jobCount,
        invoices: invoiceCount,
        payments: paymentCount,
        designs: designCount,
      },
      backupStatus: 'HEALTHY',
    };
  }

  public async logAuditAction(entry: {
    userId?: string;
    userName: string;
    action: string;
    entityType: string;
    entityId?: string;
    previousValue?: string;
    newValue?: string;
    reason?: string;
  }): Promise<AuditLogItemDto> {
    const created = await prisma.auditLog.create({
      data: {
        userId: entry.userId || null,
        userName: entry.userName,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId || null,
        previousValue: entry.previousValue || null,
        newValue: entry.newValue || null,
        reason: entry.reason || null,
      },
    });
    return created;
  }

  public async listAuditLogs(page = 1, limit = 20): Promise<{ items: AuditLogItemDto[]; total: number }> {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count(),
    ]);

    return { items, total };
  }
}

export const settingsService = new SettingsService();

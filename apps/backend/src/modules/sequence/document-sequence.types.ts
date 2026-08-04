import type { Prisma } from '@prisma/client';

/**
 * Strongly typed DocumentType enum for all document domain sequences in EBMS.
 */
export enum DocumentType {
  JOB = 'JOB',
  INV = 'INV',
  PAY = 'PAY',
  EST = 'EST',
  QUO = 'QUO',
  PO = 'PO',
  DN = 'DN',
  PUR = 'PUR',
}

/**
 * Prefix mapping for formatted document string generation.
 */
export const DOCUMENT_PREFIX_MAP: Record<DocumentType, string> = {
  [DocumentType.JOB]: 'JOB',
  [DocumentType.INV]: 'INV',
  [DocumentType.PAY]: 'PAY',
  [DocumentType.EST]: 'EST',
  [DocumentType.QUO]: 'QUO',
  [DocumentType.PO]: 'PO',
  [DocumentType.DN]: 'DN',
  [DocumentType.PUR]: 'PUR',
};

export interface SequenceGenerationOptions {
  /** Target date for extracting sequence year (defaults to current Date) */
  date?: Date;
  
  /** Optional Prisma active transaction client for atomic execution */
  tx?: Prisma.TransactionClient;
  
  /** Number padding length (defaults to 6 digits, e.g. 000001) */
  paddingLength?: number;
}

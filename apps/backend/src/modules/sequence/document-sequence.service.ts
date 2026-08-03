import { documentCounterRepository, DocumentCounterRepository } from './document-counter.repository';
import { DOCUMENT_PREFIX_MAP, DocumentType, type SequenceGenerationOptions } from './document-sequence.types';

export class DocumentSequenceService {
  constructor(
    private readonly counterRepo: DocumentCounterRepository = documentCounterRepository,
  ) {}

  /**
   * Generates a concurrency-safe, formatted document number.
   * Format: PREFIX-YYYY-NNNNNN (e.g. JOB-2026-000001, INV-2026-000042)
   *
   * @param documentType Strongly-typed document domain enum (JOB, INV, PAY, EST, QUO, PO, DN)
   * @param options Optional parameters (custom date/year, transaction client tx)
   * @returns Formatted document string
   */
  public async generateNextNumber(
    documentType: DocumentType,
    options?: SequenceGenerationOptions,
  ): Promise<string> {
    const prefix = DOCUMENT_PREFIX_MAP[documentType];
    if (!prefix) {
      throw new Error(`Unsupported document type: ${documentType}`);
    }

    const targetDate = options?.date ?? new Date();
    const year = targetDate.getFullYear();
    const paddingLength = options?.paddingLength ?? 6;

    const nextSeq = await this.counterRepo.getNextSequenceValue(documentType, year, options?.tx);
    const paddedSeq = String(nextSeq).padStart(paddingLength, '0');

    return `${prefix}-${year}-${paddedSeq}`;
  }
}

export const documentSequenceService = new DocumentSequenceService();

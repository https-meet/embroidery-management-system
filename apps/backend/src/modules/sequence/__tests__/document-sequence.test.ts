import { describe, expect, it } from 'vitest';
import { documentSequenceService } from '../document-sequence.service';
import { DocumentType } from '../document-sequence.types';

describe('DocumentSequenceService', () => {
  it('should generate sequential numbers in expected format', async () => {
    const num1 = await documentSequenceService.generateNextNumber(DocumentType.DN);
    const num2 = await documentSequenceService.generateNextNumber(DocumentType.DN);
    const year = new Date().getFullYear();

    expect(num1).toMatch(/^DN-\d{4}-\d{6}$/);
    expect(num2).toMatch(/^DN-\d{4}-\d{6}$/);

    const seq1 = parseInt(num1.split('-')[2]!, 10);
    const seq2 = parseInt(num2.split('-')[2]!, 10);
    expect(seq2 - seq1).toBe(1);
  });

  it('should generate distinct sequence numbers concurrently without duplicates', async () => {
    const promises = Array.from({ length: 10 }, () =>
      documentSequenceService.generateNextNumber(DocumentType.QUO),
    );

    const results = await Promise.all(promises);
    const uniqueResults = new Set(results);

    expect(results.length).toBe(10);
    expect(uniqueResults.size).toBe(10);
  });
});

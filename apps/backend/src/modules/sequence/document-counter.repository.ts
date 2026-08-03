import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export class DocumentCounterRepository {
  /**
   * Atomically increments and returns the next sequence integer for (entityType, year).
   * Guaranteed concurrency-safe using PostgreSQL atomic UPSERT with RETURNING.
   */
  public async getNextSequenceValue(
    entityType: string,
    year: number,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const client = tx || prisma;

    const result = await client.$queryRaw<{ last_sequence: number }[]>`
      INSERT INTO "document_counters" ("entity_type", "year", "last_sequence", "updated_at")
      VALUES (${entityType}, ${year}, 1, NOW())
      ON CONFLICT ("entity_type", "year")
      DO UPDATE SET 
        "last_sequence" = "document_counters"."last_sequence" + 1,
        "updated_at" = NOW()
      RETURNING "last_sequence";
    `;

    if (!result || result.length === 0 || typeof result[0]?.last_sequence !== 'number') {
      throw new Error(`Failed to allocate document sequence for ${entityType}-${year}.`);
    }

    return result[0].last_sequence;
  }
}

export const documentCounterRepository = new DocumentCounterRepository();

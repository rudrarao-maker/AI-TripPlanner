import { db } from '@/db';
import { embed } from 'ai';

// Mock dependencies to avoid ESM import errors
jest.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: jest.fn(() => ({
    textEmbeddingModel: jest.fn()
  }))
}));

jest.mock('@/lib/redis', () => ({
  redis: {
    get: jest.fn().mockResolvedValue(null),
    setex: jest.fn().mockResolvedValue('OK')
  }
}));

import { generateEmbedding, insertKnowledge, retrieveSimilarContext } from '@/lib/rag';
jest.mock('@/db', () => ({
  db: {
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockResolvedValue(true),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([
      { id: '1', content: 'Hidden taco stand in Paris', metadata: {}, similarity: 0.95 }
    ]),
  }
}));

jest.mock('drizzle-orm', () => {
  const original = jest.requireActual('drizzle-orm');
  return {
    ...original,
    sql: jest.fn().mockImplementation((strings: any, ...values: any) => ({
      strings,
      values
    }))
  };
});

jest.mock('ai', () => ({
  embed: jest.fn().mockResolvedValue({
    embedding: [0.1, 0.2, 0.3], // Mocked 768-dim vector
  })
}));

describe('RAG Knowledge Base (Unit Tests)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate an embedding for text', async () => {
    const result = await generateEmbedding('Test search query');
    expect(embed).toHaveBeenCalled();
    expect(result).toEqual([0.1, 0.2, 0.3]);
  });

  it('should insert knowledge with an embedding', async () => {
    await insertKnowledge('Tacos in Paris', { source: 'admin' });
    expect(embed).toHaveBeenCalledWith(expect.objectContaining({ value: 'Tacos in Paris' }));
    expect(db.insert).toHaveBeenCalled();
  });

  it('should retrieve similar context successfully', async () => {
    const results = await retrieveSimilarContext('Find me hidden gems in Paris');
    expect(embed).toHaveBeenCalledWith(expect.objectContaining({ value: 'Find me hidden gems in Paris' }));
    expect(db.select).toHaveBeenCalled();
    expect(results).toHaveLength(1);
    expect(results[0].content).toContain('Hidden taco stand');
  });
});

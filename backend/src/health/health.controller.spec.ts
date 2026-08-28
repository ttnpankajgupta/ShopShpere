import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

describe('HealthController', () => {
  let controller: HealthController;
  let prisma: { isHealthy: jest.Mock };
  let redis: { ping: jest.Mock };

  beforeEach(async () => {
    prisma = { isHealthy: jest.fn() };
    redis = { ping: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: redis },
      ],
    }).compile();

    controller = module.get(HealthController);
  });

  it('returns health status', () => {
    const result = controller.health({ headers: { 'x-request-id': 'req-1' } } as never);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ status: 'ok', service: 'shopsphere-api' });
    expect(result.meta.requestId).toBe('req-1');
  });

  it('returns ready when dependencies are up', async () => {
    prisma.isHealthy.mockResolvedValue(true);
    redis.ping.mockResolvedValue(true);

    const result = await controller.ready({ headers: { 'x-request-id': 'req-2' } } as never);
    expect(result.success).toBe(true);
    expect(result.data.checks).toEqual({ database: 'up', redis: 'up' });
  });

  it('throws when dependencies are down', async () => {
    prisma.isHealthy.mockResolvedValue(false);
    redis.ping.mockResolvedValue(false);

    await expect(
      controller.ready({ headers: { 'x-request-id': 'req-3' } } as never),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});

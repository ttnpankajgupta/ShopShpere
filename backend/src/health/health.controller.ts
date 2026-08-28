import { Controller, Get, Req, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { successResponse } from '../common/response.types';

@ApiTags('health')
@Controller('api/v1')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Liveness probe' })
  health(@Req() req: Request) {
    const requestId = req.headers['x-request-id'] as string;
    return successResponse(
      { status: 'ok' as const, service: 'shopsphere-api' },
      requestId,
    );
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  async ready(@Req() req: Request) {
    const requestId = req.headers['x-request-id'] as string;
    const [databaseUp, redisUp] = await Promise.all([
      this.prisma.isHealthy(),
      this.redis.ping(),
    ]);

    const checks = {
      database: databaseUp ? ('up' as const) : ('down' as const),
      redis: redisUp ? ('up' as const) : ('down' as const),
    };

    if (!databaseUp || !redisUp) {
      throw new ServiceUnavailableException({
        code: 'SERVICE_UNAVAILABLE',
        message: 'Service is not ready',
        details: Object.entries(checks)
          .filter(([, status]) => status === 'down')
          .map(([dependency, status]) => ({ dependency, status })),
      });
    }

    return successResponse({ status: 'ready' as const, checks }, requestId);
  }
}

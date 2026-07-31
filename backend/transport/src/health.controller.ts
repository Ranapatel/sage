import { Controller, Get } from '@nestjs/common';

/**
 * Transport service health endpoint.
 *
 * NestJS uses the global `api` prefix set in main.ts, so this is served at
 * GET /api/health. It is used by the Docker Compose healthcheck and by the
 * backend's own /health probe (transportMicroservice status).
 */
@Controller('health')
export class HealthController {
  @Get()
  health() {
    return {
      status: 'ok',
      service: 'tripsage-transport',
      timestamp: new Date().toISOString(),
    };
  }
}

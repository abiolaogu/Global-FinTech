import { Controller, Get, Header } from '@nestjs/common';

@Controller()
export class PlatformController {
  private readonly startedAt = new Date();

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'global-fintech-api',
      coreApiEnabled:
        (process.env.CORE_API_ENABLED ?? 'true').toLowerCase() === 'true',
      startedAt: this.startedAt.toISOString(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health/ready')
  ready() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  metrics() {
    const uptimeSeconds = Math.floor(
      (Date.now() - this.startedAt.getTime()) / 1000,
    );

    return [
      '# HELP atlasx_api_uptime_seconds Process uptime in seconds',
      '# TYPE atlasx_api_uptime_seconds gauge',
      `atlasx_api_uptime_seconds ${uptimeSeconds}`,
      '# HELP atlasx_api_info Build and runtime metadata',
      '# TYPE atlasx_api_info gauge',
      'atlasx_api_info{service="global-fintech-api"} 1',
    ].join('\n');
  }
}

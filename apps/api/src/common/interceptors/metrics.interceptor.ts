import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { httpRequestsTotal, httpRequestDuration } from '../../metrics/metrics.controller';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const startTime = Date.now();
    const method = request.method;
    const route = request.route?.path || request.url;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / 1000;
          const status = response.statusCode;

          httpRequestsTotal.inc({ method, route, status });
          httpRequestDuration.observe({ method, route, status }, duration);
        },
        error: (error) => {
          const duration = (Date.now() - startTime) / 1000;
          const status = error.status || 500;

          httpRequestsTotal.inc({ method, route, status });
          httpRequestDuration.observe({ method, route, status }, duration);
        },
      }),
    );
  }
}

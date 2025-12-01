"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const metrics_controller_1 = require("../../metrics/metrics.controller");
let MetricsInterceptor = class MetricsInterceptor {
    intercept(context, next) {
        var _a;
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const startTime = Date.now();
        const method = request.method;
        const route = ((_a = request.route) === null || _a === void 0 ? void 0 : _a.path) || request.url;
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                const duration = (Date.now() - startTime) / 1000;
                const status = response.statusCode;
                metrics_controller_1.httpRequestsTotal.inc({ method, route, status });
                metrics_controller_1.httpRequestDuration.observe({ method, route, status }, duration);
            },
            error: (error) => {
                const duration = (Date.now() - startTime) / 1000;
                const status = error.status || 500;
                metrics_controller_1.httpRequestsTotal.inc({ method, route, status });
                metrics_controller_1.httpRequestDuration.observe({ method, route, status }, duration);
            },
        }));
    }
};
exports.MetricsInterceptor = MetricsInterceptor;
exports.MetricsInterceptor = MetricsInterceptor = __decorate([
    (0, common_1.Injectable)()
], MetricsInterceptor);
//# sourceMappingURL=metrics.interceptor.js.map
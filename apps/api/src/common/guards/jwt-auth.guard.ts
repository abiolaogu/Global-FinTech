import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (request.user?.user_id) {
      return true;
    }
    if (typeof request.user?.sub === "string" && request.user.sub) {
      request.user.user_id = request.user.sub;
      return true;
    }

    const developerAuthEnabled =
      process.env.ALLOW_DEV_AUTH === "true" &&
      ["development", "test"].includes(process.env.NODE_ENV || "");
    if (developerAuthEnabled) {
      request.user = {
        user_id: "local-developer",
        roles: ["developer"],
      };
      return true;
    }

    throw new UnauthorizedException(
      "A verified StratoID/Authentik principal is required",
    );
  }
}

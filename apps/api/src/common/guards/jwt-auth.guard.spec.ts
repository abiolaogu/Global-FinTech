import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";

function contextFor(request: Record<string, any>): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe("JwtAuthGuard", () => {
  const originalEnvironment = process.env;

  beforeEach(() => {
    process.env = { ...originalEnvironment };
    delete process.env.ALLOW_DEV_AUTH;
    process.env.NODE_ENV = "test";
  });

  afterAll(() => {
    process.env = originalEnvironment;
  });

  it("denies a request without a verified principal by default", () => {
    const guard = new JwtAuthGuard();

    expect(() =>
      guard.canActivate(contextFor({ headers: { "x-user-id": "attacker" } })),
    ).toThrow(UnauthorizedException);
  });

  it("accepts a principal populated by the trusted StratoID/Authentik boundary", () => {
    const guard = new JwtAuthGuard();

    expect(
      guard.canActivate(
        contextFor({ user: { user_id: "user-123", roles: ["customer"] } }),
      ),
    ).toBe(true);
  });

  it("normalizes the standard JWT subject for downstream ownership checks", () => {
    const request = { user: { sub: "user-123", roles: ["customer"] } };
    const guard = new JwtAuthGuard();

    expect(guard.canActivate(contextFor(request))).toBe(true);
    expect(request.user).toEqual(
      expect.objectContaining({ sub: "user-123", user_id: "user-123" }),
    );
  });

  it("allows an explicit non-production developer identity without administrator privileges", () => {
    process.env.ALLOW_DEV_AUTH = "true";
    const request: Record<string, any> = {};
    const guard = new JwtAuthGuard();

    expect(guard.canActivate(contextFor(request))).toBe(true);
    expect(request.user).toEqual({
      user_id: "local-developer",
      roles: ["developer"],
    });
  });

  it("never enables developer authentication in production", () => {
    process.env.ALLOW_DEV_AUTH = "true";
    process.env.NODE_ENV = "production";
    const guard = new JwtAuthGuard();

    expect(() => guard.canActivate(contextFor({}))).toThrow(
      UnauthorizedException,
    );
  });

  it("does not enable developer authentication in staging", () => {
    process.env.ALLOW_DEV_AUTH = "true";
    process.env.NODE_ENV = "staging";
    const guard = new JwtAuthGuard();

    expect(() => guard.canActivate(contextFor({}))).toThrow(
      UnauthorizedException,
    );
  });
});

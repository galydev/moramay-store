import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';

/**
 * T-050: confirms the admin guard chain rejects non-admin users and
 * accepts admins. `RolesGuard` is the piece that actually enforces
 * `@Roles('admin')`; `AdminOnly()` just composes it with `JwtAuthGuard`.
 */
describe('RolesGuard (admin routes)', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const buildContext = (user: { role: string } | undefined) =>
    ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as any;

  it('rejects a customer accessing an admin-only route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const context = buildContext({ role: 'customer' });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('allows an admin accessing an admin-only route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const context = buildContext({ role: 'admin' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows any authenticated user when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = buildContext(undefined);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('reads roles metadata using ROLES_KEY', () => {
    const spy = jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    guard.canActivate(buildContext({ role: 'admin' }));

    expect(spy).toHaveBeenCalledWith(ROLES_KEY, expect.any(Array));
  });
});

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PermissionName } from "../../../generated/prisma/client";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<(PermissionName | 'SELF')[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user, params } = context.switchToHttp().getRequest();

    // 1. Check if user is ADMIN
    const isAdmin = user.roles?.includes(PermissionName.ADMIN);
    const hasAdminRequirement = requiredRoles.includes(PermissionName.ADMIN);

    if (isAdmin) {
      return true;
    }

    // 2. Check if user is trying to access 'SELF' resources
    if (requiredRoles.includes('SELF')) {
      const userId = params.id ? parseInt(params.id, 10) : null;
      if (userId && user.sub === userId) {
        return true;
      }
    }

    // 3. Check other specific roles if needed
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

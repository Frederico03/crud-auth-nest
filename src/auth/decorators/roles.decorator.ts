import { SetMetadata } from '@nestjs/common';
import { PermissionName } from "../../../generated/prisma/client";

export const ROLES_KEY = 'roles';
export const Roles = (...roles: (PermissionName | 'SELF')[]) => SetMetadata(ROLES_KEY, roles);

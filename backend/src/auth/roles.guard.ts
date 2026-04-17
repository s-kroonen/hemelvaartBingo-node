import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable, Logger,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {

  private readonly logger = new Logger(RolesGuard.name);
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        'roles',
        [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    this.logger.debug(`USER ROLES: ${user.roles}`);
    this.logger.debug(`REQUIRED ROLES: ${requiredRoles}`);
    if (!user || !user.roles) {
      throw new ForbiddenException('No roles found on user');
    }

    const hasRole = requiredRoles.some((role) =>
        user.roles.includes(role),
    );

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
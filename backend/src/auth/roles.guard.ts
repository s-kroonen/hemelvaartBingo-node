import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private roles: string[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      throw new ForbiddenException();
    }

    const hasRole = this.roles.some((r) => user.roles.includes(r));
    if (!hasRole) {
      throw new ForbiddenException();
    }

    return true;
  }
}
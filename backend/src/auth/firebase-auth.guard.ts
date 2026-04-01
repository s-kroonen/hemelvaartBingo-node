import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';

// firebase-auth.guard.ts
import { UserRepository } from '../users/user.repository';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private userRepo: UserRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) throw new UnauthorizedException();

    const token = authHeader.split(' ')[1];

    const decoded = await admin.auth().verifyIdToken(token);
    if(!decoded) throw new UnauthorizedException(decoded, 'Not authorized');
    if(!decoded.email) throw new UnauthorizedException(decoded.email, 'Invalid email address');

    const user = await this.userRepo.findByEmail(decoded.email);

    request.user = {
      ...decoded,
      dbUser: user,
      roles: user?.roles || ['user'],
    };

    return true;
  }
}
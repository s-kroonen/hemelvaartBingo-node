import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import {UserRepository} from "../users/user.repository";

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private userRepo: UserRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Check for authorization header
    if (!authHeader) throw new UnauthorizedException('Missing Authorization Header');

    // Extract token from header
    const token = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedException('Invalid Token Format');

    try {
      // Verify the ID token
      const decoded = await admin.auth().verifyIdToken(token);
      request.user = { ...decoded };

      // Check for email in decoded token
      if (!decoded.email) throw new UnauthorizedException('Invalid Email Address');

      // Fetch user from repository
      const user = await this.userRepo.findByEmail(decoded.email);
      request.user = {
        ...request.user,
        dbUser: user,
        roles: user?.roles || ['user'],
      };

    } catch (error) {
      throw new UnauthorizedException(error, 'Not authorized');
    }

    return true;
  }
}
// auth/firebase.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import * as admin from 'firebase-admin';
import { UserService } from '../users/user.service';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
    constructor(private userService: UserService) {
        super();
    }

    async validate(req: any): Promise<any> {
        const authHeader = req.headers.authorization;
        if (!authHeader) throw new UnauthorizedException('No token provided');

        const token = authHeader.split(' ')[1];
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            if (!decodedToken) throw new UnauthorizedException('No token provided');
            if (!decodedToken.email) throw new UnauthorizedException('No email provided');
            // This is where we bridge Firebase with your MongoDB
            const dbUser = await this.userService.getProfile(decodedToken.email);

            // Whatever you return here becomes "req.user"
            return {
                ...decodedToken,
                dbUser: dbUser,
                roles: dbUser?.roles || ['user'],
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid Firebase token');
        }
    }
}
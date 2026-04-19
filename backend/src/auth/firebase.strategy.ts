// auth/firebase.strategy.ts
import {Injectable, Logger, UnauthorizedException} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import * as admin from 'firebase-admin';
import { UserService } from '../users/user.service';
import config from '../config'
import {Role} from "../users/user.schema";
@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
    private readonly logger = new Logger(FirebaseStrategy.name);
    constructor(private userService: UserService) {
        super();
        this.logger.log("constructor firebase");
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
            const dbUser = await this.userService.createIfNotExists(decodedToken.email);
            if (decodedToken.email === config.defaultEmail) {
                if (!dbUser.roles.includes(Role.ADMIN)) {
                    dbUser.roles.push(Role.ADMIN);
                    await this.userService.addRoles(dbUser.id, dbUser.roles);
                }
            }
            // Whatever you return here becomes "req.user"
            return {
                ...decodedToken,
                dbUser: dbUser,
                roles: dbUser?.roles || [Role.USER],
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid Firebase token');
        }
    }
}
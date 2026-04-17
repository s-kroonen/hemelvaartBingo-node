import {Injectable, Logger} from '@nestjs/common';
import {UserRepository} from './user.repository';
import {Types} from "mongoose";
import {Role} from "./user.schema";

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);
    constructor(private repo: UserRepository) {
    }
    async updateCurrentMatch(userId: string, matchId: string) {
        return this.repo.findByIdAndUpdate(
            userId,
            {currentMatchID: new Types.ObjectId(matchId)},
            {new: true},
        );
    }

    async createIfNotExists(email: string) {
        let user = await this.repo.findByEmail(email);

        if (!user) {
            this.logger.debug(`CREATING USER: ${email}`);
            user = await this.repo.create({
                email,
                username: email.split('@')[0],
            });
        }

        this.logger.debug(`FOUND USER: ${user.email}`);
        return user;
    }

    async findAllUsers() {
        return this.repo.findAll();
    }

    async addRole(userId: string, role: Role) {
        return this.repo.findByIdAndUpdate(
            userId,
            {
                $addToSet: { roles: role },
            },
            { new: true },
        );
    }

    async addRoles(userId: string, roles: Role[]) {
        return this.repo.findByIdAndUpdate(
            userId,
            {
                $addToSet: {
                    roles: { $each: roles },
                },
            },
            { new: true },
        );
    }
    async removeRole(userId: string, role: Role) {
        return this.repo.findByIdAndUpdate(
            userId,
            {
                $pull: { roles: role },
            },
            { new: true },
        );
    }
}
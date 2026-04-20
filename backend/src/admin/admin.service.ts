import {Injectable, NotFoundException} from '@nestjs/common';
import {Types} from 'mongoose';

import {MatchService} from '../matches/match.service';
import {UserService} from '../users/user.service';
import {Role} from '../users/user.schema';
import {CardService} from "../cards/card.service";

@Injectable()
export class AdminService {
    constructor(
        private readonly matchService: MatchService,
        private readonly userService: UserService,
        private readonly cardService: CardService,
    ) {
    }


    async promoteToAdmin(userId: string) {
        return this.userService.addRole(userId, Role.ADMIN);
    }

    async addRole(userId: string, role: Role) {
        return this.userService.addRole(userId, role);
    }

    async removeRole(userId: string, role: Role) {
        return this.userService.removeRole(userId, role);
    }


    async findByUserAndCurrentMatch(userId: string) {
        const user = await this.userService.findById(userId);
        if (!user) throw new NotFoundException('User does not exist');
        const match = await this.matchService.findById(user.currentMatchID);
        if (!match) return null;
        return this.cardService.findByUserAndMatch(user._id, match._id);
    }
}

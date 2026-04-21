import {Injectable, Logger, NotFoundException} from '@nestjs/common';
import {UserRepository} from './user.repository';
import {Types} from 'mongoose';
import {CreateUserDto, Role, UpdateUserDto} from './user.schema';
import {MatchService} from "../matches/match.service";
import {CardService} from "../cards/card.service";
import {generateBingoCells} from "../shared/bingo.util";

@Injectable()
export class UserService {
    constructor(
        private repo: UserRepository,
        private matchService: MatchService,
        private cardService: CardService,) {
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
            user = await this.repo.create({
                email,
                username: email.split('@')[0],
            });
        }
        return user;
    }

    async findAllUsers() {
        return this.repo.findAll();
    }

    async addRole(userId: string, role: Role) {
        return this.repo.findByIdAndUpdate(
            userId,
            {
                $addToSet: {roles: role},
            },
            {new: true},
        );
    }

    async addRoles(userId: string, roles: Role[]) {
        return this.repo.findByIdAndUpdate(
            userId,
            {
                $addToSet: {
                    roles: {$each: roles},
                },
            },
            {new: true},
        );
    }

    async removeRole(userId: string, role: Role) {
        return this.repo.findByIdAndUpdate(
            userId,
            {
                $pull: {roles: role},
            },
            {new: true},
        );
    }

    async findByEmail(userEmail: string) {
        return this.repo.findByEmail(userEmail);
    }

    async getUser(id: string) {
        return this.repo.findById(id);
    }

    async getUsers() {
        return this.repo.findAll();
    }

    async createUser(dto: CreateUserDto) {
        return this.repo.create(dto);
    }

    async updateUser(id: string, dto: UpdateUserDto) {
        return this.repo.findByIdAndUpdate(id, dto);
    }

    async deleteUser(id: string) {
        return this.repo.delete(id)
    }

    async findById(userId: string | Types.ObjectId) {
        return this.repo.findById(userId);
    }

    async getUserByRole(role: string) {
        return this.repo.findByRole(role);
    }

    // async getCurrentMatchContext(id: any) {
    //     return this.userContextService.getCurrentMatchContext(id);
    // }
    async getCurrentMatchContext(userId: string) {
        const user = await this.repo.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        if (!user.currentMatchID) {
            return {
                match: null,
                card: null,
                awards: [],
                roleInMatch: null,
            };
        }

        const match = await this.matchService.findById(user.currentMatchID);
        if (!match) throw new NotFoundException('Match not found');

        const card = await this.cardService.findByUserAndMatch(
            user._id,
            match._id,
        );

        const isMaster = match.masters.some(id => id.equals(user._id));

        return {
            match,
            card,
            roleInMatch: isMaster ? 'master' : 'player',
        };
    }

    async getMatchContext(userId: any, matchId: string) {
        const user = await this.repo.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        if (!user.currentMatchID) {
            return {
                match: null,
                card: null,
                awards: [],
                roleInMatch: null,
            };
        }

        const match = await this.matchService.findById(matchId);
        if (!match) throw new NotFoundException('Match not found');

        const card = await this.cardService.findByUserAndMatch(
            user._id,
            match._id,
        );

        const isMaster = match.masters.some(id => id.equals(user._id));

        return {
            match,
            card,
            roleInMatch: isMaster ? 'master' : 'player',
        };
    }
    async regenerateCard(userId: string, matchId?: string) {
        const user = await this.repo.findById(userId);
        if (!user) throw new NotFoundException('User does not exist');

        const effectiveMatchId = matchId ?? user.currentMatchID;
        if (!effectiveMatchId)
            throw new NotFoundException('No match specified');

        const match = await this.matchService.findById(effectiveMatchId);
        if (!match) throw new NotFoundException('Match not found');

        const card = await this.cardService.findByUserAndMatch(
            user._id,
            match._id,
        );

        if (!card)
            throw new NotFoundException(
                `Card not found for user ${userId} and match ${effectiveMatchId}`,
            );

        const cells = generateBingoCells(match.cardSize);

        return this.cardService.updateCard(card.id, { cells });
    }

}
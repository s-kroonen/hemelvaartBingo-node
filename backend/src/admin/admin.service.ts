import { Injectable, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";

import { MatchService } from "../matches/match.service";
import { UserService } from "../users/user.service";
import {Role} from "../users/user.schema";

@Injectable()
export class AdminService {
    constructor(
        private readonly matchService: MatchService,
        private readonly userService: UserService,
    ) {}

    async createMatch(data: any) {
        return this.matchService.createMatch(data);
    }

    async assignMaster(matchId: string, userId: string) {
        const match = await this.matchService.findById(matchId);

        if (!match) {
            throw new NotFoundException(`Match with id ${matchId} not found`);
        }

        return this.matchService.addMaster(
            matchId,
            new Types.ObjectId(userId),
        );
    }

    async getAllMatches() {
        return this.matchService.findAll();
    }

    async updateMatch(matchId: string, data: any) {
        return this.matchService.updateMatch(matchId, data);
    }

    async getAllUsers() {
        return this.userService.findAllUsers();
    }

    async promoteToAdmin(userId: string) {
        return this.userService.addRole(userId, Role.ADMIN);
    }

    async addRole(userId: string, role: Role) {
        return this.userService.addRole(userId, role);
    }

    async deleteMatch(matchId: string) {
        return this.matchService.delete(matchId);
    }

    async removeRole(userId: string, role: Role) {
        return this.userService.removeRole(userId, role);
    }
}
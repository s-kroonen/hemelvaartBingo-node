import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { MatchRepository } from './match.repository';
import {Match} from "./match.schema";

import {Types} from "mongoose";
@Injectable()
export class MatchService {
    constructor(private repo: MatchRepository) {}

    async getUserMatches(userId: Types.ObjectId): Promise<Match[]> {
        const objectId = new Types.ObjectId(userId);
        return this.repo.findByUser(objectId);
    }
    async createMatch(data: any) {
        return this.repo.create(data);
    }

    async findById(id: string) {
        return this.repo.findById(id);
    }

    async findAll() {
        return this.repo.findAll();
    }

    async updateMatch(matchId: string, data: any) {
        return this.repo.update(matchId, data);
    }

    async addMaster(matchId: string, userId: Types.ObjectId) {
        const match = await this.repo.findById(matchId);

        if (!match) {
            throw new NotFoundException('Match not found');
        }

        const alreadyMaster = match.masters?.some(
            (id) => id.toString() === userId.toString(),
        );

        if (alreadyMaster) {
            throw new BadRequestException('User is already a master');
        }

        return this.repo.addMaster(matchId, userId);
    }
}
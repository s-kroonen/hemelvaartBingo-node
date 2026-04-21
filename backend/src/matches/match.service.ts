import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {MatchRepository} from './match.repository';
import {Match} from './match.schema';

import {Types} from 'mongoose';

@Injectable()
export class MatchService {
    constructor(private repo: MatchRepository) {
    }

    async getPlayerMatches(userId: Types.ObjectId): Promise<Match[]> {
        return this.repo.findByPlayer(userId);
    }

    async createMatch(data: any) {
        return this.repo.create(data);
    }

    async findById(id: string | Types.ObjectId) {
        return this.repo.findById(id);
    }

    async findAll() {
        return this.repo.findAll();
    }

    async updateMatch(matchId: string, data: any) {
        return this.repo.update(matchId, data);
    }

    async addMaster(matchId: string, userId: string) {
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

    async removeMaster(matchId: string, userId: string) {
        const match = await this.repo.findById(matchId);

        if (!match) {
            throw new NotFoundException('Match not found');
        }

        return this.repo.removeMaster(matchId, userId);
    }

    async delete(matchId: string) {
        return this.repo.delete(matchId);
    }

    async getMatchesByMaster(masterId: string) {
        const objectId = new Types.ObjectId(masterId);
        return this.repo.findByMaster(objectId);
    }

    async updateMatchName(id: string, name: string) {
        return this.repo.updateName(id, name);
    }

    async updateMatchDates(_id: any, startDate: string, endDate: string) {
        return this.repo.updateDates(_id, startDate, endDate);
    }

    async removePlayer(matchId: Types.ObjectId, userId: Types.ObjectId) {
        return this.repo.removePlayer(matchId, userId);
    }
}

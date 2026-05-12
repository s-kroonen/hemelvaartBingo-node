import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MatchRepository } from './match.repository';
import { CreateMatchDto, Match } from './match.schema';

import { Document, Types } from 'mongoose';
import { UserService } from '../users/user.service';
import { BingoMode } from '../shared/BingoConfig';

@Injectable()
export class MatchService {
  constructor(
    private repo: MatchRepository,
    private userService: UserService,
  ) {}
  async getMatchesByMaster(masterId: Types.ObjectId) {
    return this.repo.findByMaster(masterId);
  }
  async getPlayerMatches(userId: Types.ObjectId): Promise<Match[]> {
    return this.repo.findByPlayer(userId);
  }
  async getUserMatches(userId: Types.ObjectId): Promise<Match[]> {
    return this.repo.findByUser(userId);
  }
  // match.service.ts
  async getUserMatchesWithRoles(userId: Types.ObjectId) {
    const matches = await this.repo.findByUser(userId);

    return matches.map((match) => {
      // Determine the role
      const isMaster = match.masters.some((id) => id.equals(userId));
      const isPlayer = match.players.some((id) => id.equals(userId));

      let role = 'none';
      if (isMaster) role = 'master';
      else if (isPlayer) role = 'player';

      // Return a combined object
      // Use .toObject() if match is a Mongoose Document to avoid circular JSON issues
      return {
        ...(match instanceof Document ? match.toJSON() : match),
        roleInMatch: role,
      };
    });
  }

  async createMatch(data: any) {
    return this.repo.create(data);
  }

  async createMatchForUser(userId: Types.ObjectId, data: CreateMatchDto) {

    if (!Object.values(BingoMode).includes(data.mode)) {
      throw new BadRequestException(`The bingo mode ${data.mode} is not supported yet.`);
    }
    const newMatch = await this.repo.create(data);
    return this.repo.addMaster(newMatch._id, userId);
  }

  async findById(id: string | Types.ObjectId) {
    const match = await this.repo.findById(id);
    if (!match) throw new NotFoundException(`Match with id ${id} not found`);
    return match;
  }

  async findAll() {
    return this.repo.findAll();
  }

  async updateMatch(matchId: string, data: any) {
    return this.repo.update(matchId, data);
  }

  async addMaster(matchId: string, userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

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

    return this.repo.addMaster(match._id, user._id);
  }

  async removeMaster(matchId: string, userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    const match = await this.repo.findById(matchId);

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    return this.repo.removeMaster(match._id, user._id);
  }

  async delete(matchId: Types.ObjectId) {
    return this.repo.delete(matchId);
  }

  async removePlayer(matchId: Types.ObjectId, userId: Types.ObjectId) {
    return this.repo.removePlayer(matchId, userId);
  }
  async getMatchContext(userId: string, matchId?: string) {
    const user = await this.userService.findById(userId);
    if (!user?.currentMatchID) return { match: null, role: null };

    const match = await this.repo.findById(matchId ?? user.currentMatchID);
    if (!match) throw new NotFoundException('Match not found');

    const isMaster = match.masters.some((id) => id.equals(user._id));

    return {
      match,
      roleInMatch: isMaster ? 'master' : 'player',
    };
  }
}

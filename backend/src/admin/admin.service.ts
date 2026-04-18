import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import { MatchService } from '../matches/match.service';
import { UserService } from '../users/user.service';
import { Role } from '../users/user.schema';

@Injectable()
export class AdminService {
  constructor(
    private readonly matchService: MatchService,
    private readonly userService: UserService,
  ) {}


  async assignMaster(matchId: string, userId: string) {
    const match = await this.matchService.findById(matchId);

    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} not found`);
    }

    return this.matchService.addMaster(matchId, new Types.ObjectId(userId));
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
}

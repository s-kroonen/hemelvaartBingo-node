import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { Types } from 'mongoose';
import {
  CreateUserDto,
  Role,
  UpdateUserAdminDto,
  UpdateUserDto,
} from './user.schema';
import { MatchService } from '../matches/match.service';
import { CardService } from '../cards/card.service';
import { generateBingoCells } from '../shared/bingo.util';

@Injectable()
export class UserService {
  constructor(private repo: UserRepository) {}

  async updateCurrentMatch(userId: string, matchId: string) {
    return this.repo.findByIdAndUpdate(
      userId,
      { currentMatchID: new Types.ObjectId(matchId) },
      { new: true },
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

  async updateUser(id: string, dto: UpdateUserAdminDto | UpdateUserDto) {
    const $set: Record<string, any> = {};
    const $addToSet: Record<string, any> = {};

    // 1. Handle FCM Token specifically
    // We expect the frontend to send a single string 'fcmToken' in the DTO
    if ((dto as any).fcmToken) {
      $addToSet['fcmTokens'] = (dto as any).fcmToken;
    }

    // 2. Helper for nested partial updates (Settings/Tutorials)
    const applyNested = (field: string, obj: any) => {
      for (const [key, value] of Object.entries(obj)) {
        $set[`${field}.${key}`] = value;
      }
    };

    if (dto.settings) applyNested('settings', dto.settings);
    if (dto.tutorials) applyNested('tutorials', dto.tutorials);

    // 3. Handle flat fields
    for (const [key, value] of Object.entries(dto)) {
      if (key !== 'settings' && key !== 'tutorials' && key !== 'fcmToken') {
        $set[key] = value;
      }
    }

    // 4. Construct the final update object
    const finalUpdate: any = {};
    if (Object.keys($set).length > 0) finalUpdate.$set = $set;
    if (Object.keys($addToSet).length > 0) finalUpdate.$addToSet = $addToSet;

    return this.repo.findByIdAndUpdate(id, finalUpdate, { new: true });
  }

  async deleteUser(id: string) {
    return this.repo.delete(id);
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
}

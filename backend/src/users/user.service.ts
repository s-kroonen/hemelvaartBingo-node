import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import {Types} from "mongoose";

@Injectable()
export class UserService {
  constructor(private repo: UserRepository) {}

  async getProfile(email: string) {
    return this.repo.findByEmail(email);
  }

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
}
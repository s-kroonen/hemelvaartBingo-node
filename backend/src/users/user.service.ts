import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private repo: UserRepository) {}

  async getProfile(email: string) {
    return this.repo.findByEmail(email);
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
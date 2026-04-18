import {Injectable, Logger} from '@nestjs/common';
import {UserRepository} from './user.repository';
import { Types } from 'mongoose';
import { CreateUserDto, Role, UpdateUserDto } from './user.schema';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);
    constructor(private repo: UserRepository) {
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
            this.logger.debug(`CREATING USER: ${email}`);
            user = await this.repo.create({
                email,
                username: email.split('@')[0],
            });
        }

        this.logger.debug(`FOUND USER: ${user.email}`);
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
    this.logger.debug(`CREATING USER: ${dto.email}`);
    return this.repo.create(dto);
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    this.logger.debug(`UPDATE USER: ${dto.email}`);
    return this.repo.findByIdAndUpdate(id, dto);
  }

  async deleteUser(id: string) {
    this.logger.debug(`DELETE USER: ${id}`);
    return this.repo.delete(id)
  }

  async findById(userId: string) {
    return this.repo.findById(userId);
  }

  async getUserByRole(role: string) {
    return this.repo.findByRole(role);
  }
}
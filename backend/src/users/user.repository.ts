import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UserRepository {
  private readonly logger = new Logger(UserRepository.name);
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async create(user: Partial<User>) {
    return this.userModel.create(user);
  }

  async findById(id: string) {
    return this.userModel.findById(id);
  }

  async findByIdAndUpdate(
    userId: string,
    update: any, // allow Mongo operators
    options: { new: boolean } = { new: true },
  ) {
    this.logger.log(`update user with id and data ${userId}  ${update}`);
    return this.userModel.findByIdAndUpdate(userId, update, options);
  }

  async findAll() {
    return this.userModel.find();
  }

  async delete(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }
}

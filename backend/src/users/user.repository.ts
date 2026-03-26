import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async create(user: Partial<User>) {
    return this.userModel.create(user);
  }

  async findById(id: string) {
    return this.userModel.findById(id);
  }
}
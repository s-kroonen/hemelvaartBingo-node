import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BingoEvent } from './event.schema';

@Injectable()
export class EventRepository {
  constructor(@InjectModel(BingoEvent.name) private model: Model<BingoEvent>) {}

  async create(data: Partial<BingoEvent>) {
    return this.model.create(data);
  }

  async findByMatch(matchId: string | Types.ObjectId) {
    return this.model.find({ matchId: matchId });
  }

  async update(id: string, data: Partial<BingoEvent>) {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Card } from './card.schema';

@Injectable()
export class CardRepository {
  constructor(@InjectModel(Card.name) private model: Model<Card>) {}
  async findById(cardId: string) {
    return this.model.findById(cardId);
  }

  async findByUser(userId: string) {
    return this.model.find({ userId });
  }

  async findByMatch(matchId: string) {
    return this.model.find({ matchId });
  }

  async create(data: Partial<Card>) {
    return this.model.create(data);
  }

  async findByUserAndMatch(userId: Types.ObjectId, matchId: Types.ObjectId) {
    return this.model.findOne({ userId, matchId });
  }

  async updateCard(cardId: string | Types.ObjectId, update: Partial<Card>) {
    return this.model.findByIdAndUpdate(cardId, update, { new: true });
  }
  async updateCell(
    cardId: string,
    cellId: string,
    isChecked: boolean,
  ) {
    return this.model.findOneAndUpdate(
      {
        _id: cardId,
        'cells.id': cellId,
      },
      {
        $set: {
          'cells.$.isChecked': isChecked,
        },
      },
      { new: true },
    );
  }
  async delete(cardId: string | Types.ObjectId) {
    return this.model.findByIdAndDelete(cardId);
  }

  // private toObjectId(id: string | Types.ObjectId) {
  //   return typeof id === 'string' ? new Types.ObjectId(id) : id;
  // }
}

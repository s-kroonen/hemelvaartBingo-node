import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import {Card} from "./card.schema";

@Injectable()
export class CardRepository {
    constructor(@InjectModel(Card.name) private model: Model<Card>) {}

    findByUser(userId: string) {
        return this.model.find({ userId });
    }

    findByMatch(matchId: string) {
        return this.model.find({ matchId });
    }

    create(data: Partial<Card>) {
        return this.model.create(data);
    }
    async findByUserAndMatch(userId: Types.ObjectId, matchId: Types.ObjectId) {
        return this.model.findOne({ userId, matchId });
    }
    updateCard(cardId: string, card: { grid: number[][]; marked: boolean[][]; }) {
        return this.model.findByIdAndUpdate(
            cardId,
            card,
            {new: true},
        );
    }
}
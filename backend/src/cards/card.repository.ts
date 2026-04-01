import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
}
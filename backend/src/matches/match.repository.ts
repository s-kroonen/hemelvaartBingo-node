import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import { Match } from './match.schema';

@Injectable()
export class MatchRepository {
    constructor(@InjectModel(Match.name) private model: Model<Match>) {}

    create(data: Partial<Match>) {
        return this.model.create(data);
    }

    findAll() {
        return this.model.find().populate('masters players');
    }

    findById(id: string) {
        return this.model.findById(id);
    }

    update(id: string, data: Partial<Match>) {
        return this.model.findByIdAndUpdate(id, data, { new: true });
    }

    delete(id: string) {
        return this.model.findByIdAndDelete(id);
    }
    async addMaster(matchId: string, userId: Types.ObjectId) {
        return this.model.findByIdAndUpdate(
            matchId,
            {
                $addToSet: { masters: userId },
            },
            { new: true },
        ).exec();
    }
    async findByUser(userId: Types.ObjectId): Promise<Match[]> {
        return this.model.find({
            players: userId,
        });
    }
}
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import {Match} from './match.schema';

@Injectable()
export class MatchRepository {
    constructor(@InjectModel(Match.name) private model: Model<Match>) {
    }

    create(data: Partial<Match>) {
        return this.model.create(data);
    }

    findAll() {
        return this.model.find().populate('masters players');
    }

    async findById(id: string | Types.ObjectId) {
        return this.model.findById(id).populate('masters players');
    }

    update(id: string, data: Partial<Match>) {
        return this.model.findByIdAndUpdate(id, data, {new: true});
    }

    delete(id: string) {
        return this.model.findByIdAndDelete(id);
    }

    async addMaster(matchId: string, userId: string) {
        return this.model
            .findByIdAndUpdate(
                matchId,
                {
                    $addToSet: {masters: userId},
                },
                {new: true},
            )
            .exec();
    }

    async removeMaster(matchId: string, userId: string) {
        return this.model
            .findByIdAndUpdate(
                matchId,
                {
                    $pull: {masters: userId},
                },
                {new: true},
            )
            .exec();
    }

    async findByPlayer(userId: Types.ObjectId): Promise<Match[]> {
        return this.model.find({
            players: userId,
        });
    }

    async findByMaster(masterId: Types.ObjectId): Promise<Match[]> {
        return this.model.find({
            masters: masterId,
        });
    }

    async updateName(id: string, name: string) {
        return this.model.findByIdAndUpdate(id, {name: name});
    }

    async updateDates(_id: any, startDate: string, endDate: string) {
        return this.model.findByIdAndUpdate(_id, {startDate, endDate});
    }

    async removePlayer(matchId: Types.ObjectId, userId: Types.ObjectId) {
        return this.model
            .findByIdAndUpdate(
                matchId,
                {
                    $pull: {players: userId},
                },
                {new: true},
            )
            .exec();
    }
}

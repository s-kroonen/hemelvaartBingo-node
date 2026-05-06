import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import {BingoEvent} from './event.schema';

@Injectable()
export class EventRepository {
    constructor(@InjectModel(BingoEvent.name) private model: Model<BingoEvent>) {
    }

    async findLatestCalled(matchId: string) {
        return this.model.findOne({
            matchId: new Types.ObjectId(matchId),
            isCalled: true
        }, { sort: { calledAt: -1 } });
    }

    async findCalledHistory(matchId: string) {
        return this.model.find({
            matchId: new Types.ObjectId(matchId),
            isCalled: true
        }, { sort: { calledAt: -1 } });
    }
    async create(data: Partial<BingoEvent>) {
        return this.model.create(data);
    }

    async findByMatch(matchId: Types.ObjectId) {
        return this.model.find({matchId: matchId});
    }

    async update(id: Types.ObjectId, data: Partial<BingoEvent>) {
        return this.model.findByIdAndUpdate(id, data, {new: true});
    }

    async findById(eventId: string | Types.ObjectId) {
        return this.model.findById(eventId);
    }

    async deleteForMatch(eventId: Types.ObjectId, matchId: Types.ObjectId) {
        return this.model.findOneAndDelete({_id: eventId, matchId: matchId});
    }
}

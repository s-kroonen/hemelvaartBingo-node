import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import {BingoEvent} from './event.schema';

@Injectable()
export class EventRepository {
    constructor(@InjectModel(BingoEvent.name) private model: Model<BingoEvent>) {
    }

    async findLatestCalled(matchId: Types.ObjectId) {
        return this.model
            .findOne({
                matchId: matchId,
                called: true
            })
            .sort({calledAt: -1}) // Chain the sort here
            .exec(); // Use .exec() to return a real Promise
    }

    async findCalledHistory(matchId: Types.ObjectId) {
        return this.model
            .find({
                matchId: matchId,
                called: true
            })
            .sort({calledAt: -1}) // Newest first
            .exec();
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

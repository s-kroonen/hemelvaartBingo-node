import {InjectModel} from '@nestjs/mongoose';
import {Invite} from './invite.schema';
import {Model, Types} from 'mongoose';
import {Injectable} from '@nestjs/common';

@Injectable()
export class InviteRepository {
    constructor(@InjectModel(Invite.name) private inviteModel: Model<Invite>) {
    }

    async findByToken(token: string) {
        return this.inviteModel.findOne({token, isActive: true});
    }

    async create(data: Partial<Invite>) {
        return this.inviteModel.create(data);
    }

    async findAll() {
        return this.inviteModel.find();
    }

    async findByMatch(matchId: string) {
        return this.inviteModel.find({
            matchId: new Types.ObjectId(matchId),
        });
    }

    async delete(id: string) {
        return this.inviteModel.findByIdAndDelete(id);
    }

    async findById(inviteId: string | Types.ObjectId) {
        return this.inviteModel.findById(inviteId);
    }

    async findByIdAndUpdate(
        id: string,
        data: any, // allow Mongo operators
        options: { new: boolean } = {new: true},
    ) {
        return this.inviteModel.findByIdAndUpdate(id, data, options);
    }
}

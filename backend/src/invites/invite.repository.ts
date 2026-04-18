import { InjectModel } from '@nestjs/mongoose';
import { Invite } from './invite.schema';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InviteRepository {
  constructor(@InjectModel(Invite.name) private inviteModel: Model<Invite>) {}

  findByToken(token: string) {
    return this.inviteModel.findOne({ token, isActive: true });
  }

  create(data: Partial<Invite>) {
    return this.inviteModel.create(data);
  }

  findAll() {
    return this.inviteModel.find()
      .populate('matchId')
  }

  findByMatch(matchId: string) {
    return this.inviteModel.find({ matchId });
  }

  delete(id: string) {
    return this.inviteModel.findByIdAndDelete(id);
  }
}

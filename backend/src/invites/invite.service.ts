import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { InviteRepository } from './invite.repository';
import { CardService } from '../cards/card.service';
import { MatchService } from '../matches/match.service';
import { UserService } from '../users/user.service';

@Injectable()
export class InviteService {
  constructor(
    private inviteRepo: InviteRepository,
    private matchRepo: MatchService,
    private userRepo: UserService,
    private cardService: CardService,
  ) {}

  async joinMatch(token: string, userEmail: string) {
    const invite = await this.inviteRepo.findByToken(token);

    if (!invite) {
      throw new NotFoundException('Invalid invite');
    }

    if (!invite.isActive) {
      throw new BadRequestException('Invite is inactive');
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new BadRequestException('Invite expired');
    }

    const user = await this.userRepo.findByEmail(userEmail);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const match = await this.matchRepo.findById(invite.matchId.toString());
    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const userId = new Types.ObjectId(user._id);
    const matchId = new Types.ObjectId(match._id);

    // Add user to match safely
    const alreadyInMatch = match.players.some((p) => {
      const id = p._id ?? p; // works for populated & non-populated
      return id.equals(userId);
    });

    if (!alreadyInMatch) {
      match.players.push(userId);
      await match.save();
    }

    // Set current match
    user.currentMatchID = matchId;
    await user.save();

    // Check if card exists (use repo method ideally)
    const existingCard = await this.cardService.findByUserAndMatch(
      userId,
      matchId,
    );

    if (!existingCard) {
      await this.cardService.createCard(
        userId.toString(),
        matchId.toString(),
        match.cardSize,
      );
    }

    return {
      success: true,
      matchId: matchId,
    };
  }

  async createInvite(matchId: Types.ObjectId) {
    return this.inviteRepo.create({
      matchId: matchId,
      token: crypto.randomUUID(),
      isActive: true,
    });
  }

  async findAll() {
    return this.inviteRepo.findAll();
  }

  async delete(id: string) {
    return this.inviteRepo.delete(id);
  }

  async findByMatch(matchId: string) {
    return this.inviteRepo.findByMatch(matchId);
  }

  async findById(inviteId: string) {
    return this.inviteRepo.findById(inviteId);
  }

  async updateInvite(id: string, data: any) {
    return this.inviteRepo.findByIdAndUpdate(id, data);
  }

  async findByToken(token: string) {
    return this.inviteRepo.findByToken(token);
  }
}

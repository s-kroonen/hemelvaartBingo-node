import { Injectable, NotFoundException } from '@nestjs/common';
import { CardRepository } from './card.repository';
import { generateBingoCells } from '../shared/bingo.util';
import { Types } from 'mongoose';
import { Card } from './card.schema';
import { UserService } from '../users/user.service';
import { MatchService } from '../matches/match.service';

@Injectable()
export class CardService {
  constructor(
    private cardRepo: CardRepository,
    private userService: UserService,
    private matchService: MatchService,
  ) {}

  async createCard(userId: string, matchId: string, size: number) {
    const cells = generateBingoCells(size);

    return this.cardRepo.create({
      userId: new Types.ObjectId(userId),
      matchId: new Types.ObjectId(matchId),
      cells,
    });
  }

  async updateCard(id: string, card: Partial<Card>) {
    return this.cardRepo.updateCard(id, card);
  }

  async findByUser(userId: string) {
    return this.cardRepo.findByUser(userId);
  }

  async findByUserAndMatch(userId: Types.ObjectId, matchId: Types.ObjectId) {
    return this.cardRepo.findByUserAndMatch(userId, matchId);
  }

  async updateCellState(
    userId: Types.ObjectId,
    matchId: Types.ObjectId,
    cellId: string,
    state: boolean,
  ) {
    return this.cardRepo.updateCellState(userId, matchId, cellId, state);
  }
  async regenerateCard(userId: string, matchId?: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User does not exist');

    const effectiveMatchId = matchId ?? user.currentMatchID;
    if (!effectiveMatchId) throw new NotFoundException('No match specified');

    const match = await this.matchService.findById(effectiveMatchId);
    if (!match) throw new NotFoundException('Match not found');

    const card = await this.cardRepo.findByUserAndMatch(user._id, match._id);

    if (!card)
      throw new NotFoundException(
        `Card not found for user ${userId} and match ${effectiveMatchId}`,
      );

    const cells = generateBingoCells(match.cardSize);

    return this.cardRepo.updateCard(card.id, { cells });
  }
  // async findByUserAndCurrentMatch(userId: string) {
  //   const user = await this.userService.findById(userId);
  //   if (!user) throw new NotFoundException('User does not exist');
  //   const match = await this.matchService.findById(user.currentMatchID);
  //   if (!match) return null;
  //   return this.cardRepo.findByUserAndMatch(user._id, match._id);
  // }
}

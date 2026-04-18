import { Injectable, NotFoundException } from '@nestjs/common';
import { CardRepository } from './card.repository';
import { createMarkedGrid, generateBingoCard } from '../shared/bingo.util';
import { Types } from 'mongoose';
import { MatchService } from '../matches/match.service';
import { UserService } from '../users/user.service';

@Injectable()
export class CardService {
  constructor(
    private cardRepo: CardRepository,
    private matchService: MatchService,
    private userService: UserService,
  ) {}

  async createCard(userId: string, matchId: string, size: number) {
    const grid = generateBingoCard(size);
    const marked = createMarkedGrid(size);

    return this.cardRepo.create({
      userId: new Types.ObjectId(userId),
      matchId: new Types.ObjectId(matchId),
      grid,
      marked,
    });
  }

  async regenerateCard(userId: string) {

    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User does not exist');

    const card = await this.findByUserAndCurrentMatch(userId);
    if (!card)
      throw new NotFoundException('User Card not found for user' + userId);

    const match = await this.matchService.findById(user.currentMatchID);
    if (!match)
      throw new NotFoundException(
        'Card found but no match with id ' + card.matchId,
      );
    const grid = generateBingoCard(match.cardSize);
    const marked = createMarkedGrid(match.cardSize);

    return this.cardRepo.updateCard(card.id, { grid, marked });
  }

  async findByUser(userId: string) {
    return this.cardRepo.findByUser(userId);
  }

  async findByUserAndMatch(userId: Types.ObjectId, matchId: Types.ObjectId) {
    return this.cardRepo.findByUserAndMatch(userId, matchId);
  }

  async findByUserAndCurrentMatch(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User does not exist');
    const match = await this.matchService.findById(user.currentMatchID);
    if (!match) throw new NotFoundException('Match does not exist');
    return this.cardRepo.findByUserAndMatch(user._id, match._id);
  }
}

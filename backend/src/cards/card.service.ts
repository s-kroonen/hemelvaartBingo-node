import { Injectable, NotFoundException } from '@nestjs/common';
import { CardRepository } from './card.repository';
import { generateBingoCells } from '../shared/bingo.util';
import { Types } from 'mongoose';
import { Card } from './card.schema';
import { UserService } from '../users/user.service';
import { MatchService } from '../matches/match.service';
import { BingoResultDto } from '../matches/match.schema';
import { BingoMode } from '../shared/BingoConfig';

@Injectable()
export class CardService {
  constructor(
    private cardRepo: CardRepository,
    private userService: UserService,
    private matchService: MatchService,
  ) {}

  async createCard(userId: string, matchId: string, size: BingoMode) {
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
    const cells = generateBingoCells(match.mode);
    if (!card) {
      return this.cardRepo.create({
        userId: user._id,
        matchId: match._id,
        cells,
      });
    } else {
      return this.cardRepo.updateCard(card.id, { cells });
    }
  }

  // async findByUserAndCurrentMatch(userId: string) {
  //   const user = await this.userService.findById(userId);
  //   if (!user) throw new NotFoundException('User does not exist');
  //   const match = await this.matchService.findById(user.currentMatchID);
  //   if (!match) return null;
  //   return this.cardRepo.findByUserAndMatch(user._id, match._id);
  // }
  async verifyBingo(
    matchId: string,
    cardId: string,
    userId: string,
  ): Promise<BingoResultDto> {
    const match = await this.matchService.findById(matchId);
    if (!match) throw new NotFoundException('Match not found');
    const card = await this.findById(cardId);
    if (!card) throw new NotFoundException('Card not found');

    // 1. Basic Security Check
    if (card.userId.toString() !== userId.toString()) {
      return { isValid: false, message: "This isn't your card!" };
    }

    // 2. Cross-reference: Are the "checked" cells actually called by the master?
    const checkedNumbers = card.cells
      .filter((cell) => cell.isChecked)
      .map((cell) => parseInt(cell.value));

    const invalidNumbers = checkedNumbers.filter(
      (num) => !match.calledNumbers.includes(num),
    );

    if (invalidNumbers.length > 0) {
      return {
        isValid: false,
        message: "You checked numbers that haven't been called yet!",
      };
    }

    // 3. Pattern Recognition (Rows, Columns, Diagonals)
    const isWinner = this.checkPatterns(card.cells, match.mode);

    if (isWinner) {
      return {
        isValid: true,
        message: 'BINGO! You won!',
        prize: 'Standard Prize', // This could be pulled from the Match schema later
      };
    }

    return { isValid: false, message: 'Not a bingo yet. Keep playing!' };
  }

  private checkPatterns(cells: any[], mode: BingoMode): boolean {
    // Logic to check 5x5 (or 'size' x 'size') grid for a full line
    // Implementation depends on how your 'cells' are stored (index-based)
    return true; // Simplified for now
  }

  private async findById(cardId: string) {
    return this.cardRepo.findById(cardId);
  }
}

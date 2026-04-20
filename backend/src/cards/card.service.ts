import {Injectable, NotFoundException} from '@nestjs/common';
import {CardRepository} from './card.repository';
import {generateBingoCells} from '../shared/bingo.util';
import {Types} from 'mongoose';
import {Card} from "./card.schema";

@Injectable()
export class CardService {
    constructor(
        private cardRepo: CardRepository
    ) {
    }

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

    // async findByUserAndCurrentMatch(userId: string) {
    //   const user = await this.userService.findById(userId);
    //   if (!user) throw new NotFoundException('User does not exist');
    //   const match = await this.matchService.findById(user.currentMatchID);
    //   if (!match) return null;
    //   return this.cardRepo.findByUserAndMatch(user._id, match._id);
    // }

}

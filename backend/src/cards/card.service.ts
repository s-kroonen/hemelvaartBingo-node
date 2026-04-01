import {Injectable} from "@nestjs/common";
import {CardRepository} from "./card.repository";
import {createMarkedGrid, generateBingoCard} from "../shared/bingo.util";
import {Types} from "mongoose";

@Injectable()
export class CardService {
    constructor(public cardRepo: CardRepository) {}

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

    async regenerateCard(cardId: string, size: number) {
        const grid = generateBingoCard(size);
        const marked = createMarkedGrid(size);

        return this.cardRepo.updateCard(
            cardId,
            { grid, marked },
        );
    }
}
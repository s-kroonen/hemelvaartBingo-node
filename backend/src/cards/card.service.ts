import {Injectable, NotFoundException} from '@nestjs/common';
import {CardRepository} from './card.repository';
import {generateBingoCells} from '../shared/bingo.util';
import {Types} from 'mongoose';
import {BingoCell, Card} from './card.schema';
import {UserService} from '../users/user.service';
import {MatchService} from '../matches/match.service';
import {BingoResultDto} from '../matches/match.schema';
import {BingoMode} from '../shared/BingoConfig';
import {MatchGateway} from "../matches/match.gateway";
import {NotificationService} from "../notifications/notification.service";

@Injectable()
export class CardService {
    constructor(
        private cardRepo: CardRepository,
        private userService: UserService,
        private matchService: MatchService,
        private matchGateway: MatchGateway,
        private notificationService: NotificationService,
    ) {
    }

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
            return this.cardRepo.updateCard(card.id, {cells});
        }
    }



    // async findByUserAndCurrentMatch(userId: string) {
    //   const user = await this.userService.findById(userId);
    //   if (!user) throw new NotFoundException('User does not exist');
    //   const match = await this.matchService.findById(user.currentMatchID);
    //   if (!match) return null;
    //   return this.cardRepo.findByUserAndMatch(user._id, match._id);
    // }

    // Only verifyBingo changes — getCompletedLines stays exactly the same.

    async verifyBingo(
        matchId: string,
        cardId: string,
        userId: string,
    ): Promise<BingoResultDto> {
        const match = await this.matchService.findById(matchId);
        if (!match) throw new NotFoundException('Match not found');

        const card = await this.findById(cardId);
        if (!card) throw new NotFoundException('Card not found');

        // 1. Ownership check
        if (card.userId.toString() !== userId.toString()) {
            return {isValid: false, message: "This isn't your card!"};
        }

        // 2. Build normalised grid
        const size = Math.round(Math.sqrt(card.cells.length));
        const grid: BingoCell[][] = [];
        for (let r = 0; r < size; r++) {
            grid.push(card.cells.slice(r * size, r * size + size));
        }

        // 3. Cross-reference: checked non-FREE cells must be in calledNumbers
        const calledSet = new Set(match.calledNumbers.map(String));
        const invalidCells = grid.flat().filter((cell) => {
            if (!cell.isChecked) return false;
            if (cell.value.toUpperCase() === 'FREE') return false;
            return !calledSet.has(String(cell.value));
        });


        if (invalidCells.length > 0) {
            return {isValid: false, message: "You checked numbers that haven't been called yet!"};
        }

        // 4. Line detection
        const alreadyClaimed = new Set<string>(card.claimedLines ?? []);
        const allCompletedLines = this.getCompletedLines(grid, size);
        const newLines = allCompletedLines.filter((key) => !alreadyClaimed.has(key));

        if (newLines.length === 0) {
            // WebSocket: tell the room it was a false bingo
            this.matchGateway.emitFalseBingoAlert(matchId, {
                userId,
                cardId,
                message: 'Someone claimed BINGO, but it was invalid!',
            });

            // Push notification: tell all players who called the false bingo
            await this.notificationService.notifyBingo(matchId, userId, false, false);

            return {isValid: false, message: 'Not a bingo yet. Keep playing!'};
        }

        // 5. Persist newly claimed lines
        await this.cardRepo.updateCardClaimedLines(cardId, [...alreadyClaimed, ...newLines]);

        // 6. Full-card check
        const isFullCard = grid.flat().every(
            (cell) => cell.isChecked || cell.value.toUpperCase() === 'FREE',
        );

        // 7. WebSocket: live UI update for the whole room
        this.matchGateway.emitBingoAlert(matchId, {
            userId,
            cardId,
            newLines,
            isFullCard,
            message: isFullCard
                ? 'Someone got a FULL CARD!'
                : `Someone got BINGO! (${newLines.length} line${newLines.length > 1 ? 's' : ''})`,
        });

        // 8. Push notification: tell all players who got the bingo
        await this.notificationService.notifyBingo(matchId, userId, true, isFullCard);

        return {
            isValid: true,
            message: isFullCard
                ? 'Full card! Amazing!'
                : `BINGO! You completed ${newLines.length} line${newLines.length > 1 ? 's' : ''}!`,
            prize: isFullCard ? 'Grand Prize' : 'Standard Prize',
            newLines: newLines.length,
            isFullCard,
        };
    }

    /**
     * Returns the key of every completed line in the grid.
     * A line is complete when every cell is either checked or FREE.
     *
     * Key format:
     *   "row-{r}"          horizontal line for row r
     *   "col-{c}"          vertical line for column c
     *   "diag-main"        top-left → bottom-right diagonal
     *   "diag-anti"        top-right → bottom-left diagonal
     */
    private getCompletedLines(grid: BingoCell[][], size: number): string[] {
        const completed: string[] = [];

        const isActive = (cell: BingoCell) =>
            cell.isChecked || cell.value.toUpperCase() === 'FREE';

        // Rows
        for (let r = 0; r < size; r++) {
            if (grid[r].every(isActive)) {
                completed.push(`row-${r}`);
            }
        }

        // Columns
        for (let c = 0; c < size; c++) {
            if (grid.every((row) => isActive(row[c]))) {
                completed.push(`col-${c}`);
            }
        }

        // Main diagonal (top-left → bottom-right)
        if (grid.every((row, i) => isActive(row[i]))) {
            completed.push('diag-main');
        }

        // Anti-diagonal (top-right → bottom-left)
        if (grid.every((row, i) => isActive(row[size - 1 - i]))) {
            completed.push('diag-anti');
        }

        return completed;
    }

    private async findById(cardId: string) {
        return this.cardRepo.findById(cardId);
    }
}

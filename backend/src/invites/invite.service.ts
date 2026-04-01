import {Injectable} from "@nestjs/common";
import {InviteRepository} from "./invite.repository";
import {MatchRepository} from "../matches/match.repository";
import {CardService} from "../cards/card.service";
import {UserRepository} from "../users/user.repository";

@Injectable()
export class InviteService {
    constructor(
        private inviteRepo: InviteRepository,
        private matchRepo: MatchRepository,
        private userRepo: UserRepository,
        private cardService: CardService,
    ) {}

    async joinMatch(token: string, userEmail: string) {
        const invite = await this.inviteRepo.findByToken(token);

        if (!invite) throw new Error('Invalid invite');

        const user = await this.userRepo.findByEmail(userEmail);
        const match = await this.matchRepo.findById(
            invite.matchId.toString(),
        );

        // Add user to match if not already
        if (!match.players.includes(user._id)) {
            match.players.push(user._id);
            await match.save();
        }

        // Set current match
        user.currentMatchID = match._id;
        await user.save();

        // Check if card exists
        const existingCard = await this.cardService.cardRepo.model.findOne({
            userId: user._id,
            matchId: match._id,
        });

        if (!existingCard) {
            await this.cardService.createCard(
                user._id.toString(),
                match._id.toString(),
                match.cardSize,
            );
        }

        return { success: true, matchId: match._id };
    }
}
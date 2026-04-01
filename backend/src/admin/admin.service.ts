import {MatchRepository} from "../matches/match.repository";
import {UserRepository} from "../users/user.repository";
import {Injectable, NotFoundException} from "@nestjs/common";
import {Types} from "mongoose";

@Injectable()
export class AdminService {
    constructor(
        private matchRepo: MatchRepository,
        private userRepo: UserRepository,
    ) {}

    async createMatch(data) {
        return this.matchRepo.create(data);
    }

    async assignMaster(matchId: string, userId: string) {
        const match = await this.matchRepo.findById(matchId);

        if (!match) {
            throw new NotFoundException(`Match with id ${matchId} not found`);
        }

        const userObjectId = new Types.ObjectId(userId);

        const alreadyMaster = match.masters.some(
            (id) => id.toString() === userObjectId.toString(),
        );

        if (!alreadyMaster) {
            match.masters.push(userObjectId);
        }

        return match.save();
    }

    async getAllMatches() {
        return this.matchRepo.findAll();
    }

    async updateMatch(matchId: string, data) {
        return this.matchRepo.update(matchId, data);
    }

    async getAllUsers() {
        return this.userRepo['userModel'].find(); // quick debug access
    }

    async promoteToAdmin(userId: string) {
        return this.userRepo['userModel'].findByIdAndUpdate(userId, {
            $addToSet: { roles: 'admin' },
        });
    }
}
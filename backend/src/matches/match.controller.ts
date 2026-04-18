import {
  Controller,
  Get,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { MatchService } from './match.service';
import { UserService } from '../users/user.service';
import { Types } from "mongoose";

@Controller('matches')
export class MatchController {
    constructor(
        private matchService: MatchService,
        private userService: UserService,
    ) {}

    @UseGuards(FirebaseAuthGuard)
    @Get('my')
    async getMyMatches(@Req() req) {
        const email = req.user.email;

        const user = await this.userService.findByEmail(email);
        if (!user) throw new NotFoundException('User not found');
        const userId = new Types.ObjectId(user._id);
        return this.matchService.getUserMatches(userId);
    }
}
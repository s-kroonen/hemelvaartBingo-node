import { MatchService } from './match.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';

@Controller('matches')
@UseGuards(FirebaseAuthGuard)
export class MatchController {
  constructor(private matchService: MatchService) {}

  @Get('context') // GET /matches/context
  async getContext(@Req() req) {
    // req.user.id is injected by your Auth Strategy
    return this.matchService.getMatchContext(req.user.dbUser._id);
  }

  @Get() // GET /matches (All matches for the user)
  async getMyMatches(@Req() req) {
    return this.matchService.getPlayerMatches(req.user.dbUser._id);
  }
}
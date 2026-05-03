import { MatchService } from './match.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import {Controller, Get, Param, Req, UseGuards} from '@nestjs/common';

@Controller('matches')
@UseGuards(FirebaseAuthGuard)
export class MatchController {
  constructor(private matchService: MatchService) {}

  @Get('context') // GET /matches/context
  async getContext(@Req() req) {
    // req.user.id is injected by your Auth Strategy
    return this.matchService.getMatchContext(req.user.dbUser._id);
  }
  @Get('context/:id') // GET /matches/context/:id
  async getMatchContext(@Req() req,@Param('id') matchId: string) {
    // req.user.id is injected by your Auth Strategy
    return this.matchService.getMatchContext(req.user.dbUser._id, matchId);
  }
  @Get('/:id') // GET /matches/:id (match for the user)
  async getMatch(@Req() req,@Param('id') matchId: string) {
    return this.matchService.findById(matchId);
  }
  @Get() // GET /matches (All matches for the user)
  async getMyMatches(@Req() req) {
    return this.matchService.getPlayerMatches(req.user.dbUser._id);
  }
}
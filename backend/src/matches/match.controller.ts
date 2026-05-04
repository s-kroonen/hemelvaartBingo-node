import { MatchService } from './match.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateMatchDto, UpdateMatchDto } from './match.schema';
import { IsMasterGuard } from '../auth/isMaster.guard';
import { CardService } from '../cards/card.service';
import { UserService } from '../users/user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('matches')
@UseGuards(FirebaseAuthGuard)
export class MatchController {
  constructor(
    private matchService: MatchService,
    userService: UserService,
  ) {}

  @Get('context') // GET /matches/context
  async getContext(@Req() req) {
    // req.user.id is injected by your Auth Strategy
    return this.matchService.getMatchContext(req.user.dbUser._id);
  }
  @Get('context/:id') // GET /matches/context/:id
  async getMatchContext(@Req() req, @Param('id') matchId: string) {
    // req.user.id is injected by your Auth Strategy
    return this.matchService.getMatchContext(req.user.dbUser._id, matchId);
  }
  @Get('/:id') // GET /matches/:id (match for the user)
  async getMatch(@Req() req, @Param('id') matchId: string) {
    return this.matchService.findById(matchId);
  }
  @Get() // GET /matches (All matches for the user)
  async getMyMatches(@Req() req) {
    return this.matchService.getPlayerMatches(req.user.dbUser._id);
  }
  @Post()
  async createMatch(@Body() dto: CreateMatchDto) {
    return this.matchService.createMatch(dto);
  }

  @UseGuards(IsMasterGuard)
  @Put('/:matchId')
  async updateMatch(
    @Req() req,
    @Param('matchId') matchId: string,
    @Body() dto: UpdateMatchDto,
  ) {
    return this.matchService.updateMatch(req.match._id, dto);
  }
}
@Controller('matches/:matchId/participants')
@UseGuards(FirebaseAuthGuard, IsMasterGuard)
export class ParticipantController {
  constructor(
    private matchService: MatchService,
    private cardService: CardService,
    private userService: UserService,
  ) {}

  @Delete(':userId')
  async kickPlayer(@Req() req, @Param('userId') userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);
    return this.matchService.removePlayer(req.match._id, user._id);
  }

  @Post(':userId/regenerate-card')
  async redoCard(@Req() req, @Param('userId') userId: string) {
    return this.cardService.regenerateCard(userId, req.match._id);
  }
}

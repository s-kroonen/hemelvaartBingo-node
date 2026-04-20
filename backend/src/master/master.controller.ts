import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CardService } from '../cards/card.service';
import { MatchService } from '../matches/match.service';
import { Role } from '../users/user.schema';
import { UpdateMatchDto } from '../matches/match.schema';
import { EventService } from '../events/event.service';
import { CreateEventDto } from '../events/event.schema';

@Controller('master')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles(Role.MASTER)
export class MasterController {
  constructor(
    private cardService: CardService,
    private matchService: MatchService,
    private eventService: EventService,
  ) {}

  // @Post('cards/:id/regenerate')
  // regenerate(@Param('id') id: string, @Body() body) {
  //     return this.cardService.regenerateCard(id);
  // }
  @Get('matches')
  getMyMatches(@Req() req) {
    return this.matchService.getMatchesByMaster(req.user.dbUser.id);
  }
  @Get('matches/:matchId')
  getMyMatchDetail(@Param('matchId') matchId: string) {
    return this.matchService.findById(matchId);
  }
  @Put('matches/:matchId/name')
  updateMatchName(
    @Param('matchId') matchId: string,
    @Body() dto: UpdateMatchDto,
  ) {
    return this.matchService.updateMatchName(matchId, dto.name);
  }
  @Get('matches/:matchId/events')
  async getMyMatchEvents(@Param('matchId') matchId: string) {
    const match = await this.matchService.findById(matchId);
    if (!match)
      throw new NotFoundException(`Match with id ${matchId} not found`);
    return this.eventService.findByMatch(match._id);
  }
  @Post('matches/:matchId/events')
  async createEventForMatch(
    @Param('matchId') matchId: string,
    @Body() dto: CreateEventDto,
  ) {
    const match = await this.matchService.findById(matchId);
    if (!match)
      throw new NotFoundException(`Match with id ${matchId} not found`);
    return this.eventService.createForMatch(dto, match.id);
  }
}

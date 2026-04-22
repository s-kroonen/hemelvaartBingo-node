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
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CardService } from '../cards/card.service';
import { MatchService } from '../matches/match.service';
import { Role } from '../users/user.schema';
import { UpdateMatchDto } from '../matches/match.schema';
import { EventService } from '../events/event.service';
import { CreateEventDto, UpdateEventDto } from '../events/event.schema';
import { UserService } from '../users/user.service';
import { InviteService } from '../invites/invite.service';

@Controller('master')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles(Role.MASTER)
export class MasterController {
  constructor(
    private cardService: CardService,
    private matchService: MatchService,
    private eventService: EventService,
    private userService: UserService,
    private inviteService: InviteService,
  ) {}

  @Get('matches')
  getMyMatches(@Req() req) {
    return this.matchService.getMatchesByMaster(req.user.dbUser.id);
  }

  @Get('matches/:matchId')
  getMyMatchDetail(@Param('matchId') matchId: string) {
    return this.matchService.findById(matchId);
  }

  @Put('matches/:matchId/name')
  async updateMatchName(
    @Param('matchId') matchId: string,
    @Body() dto: UpdateMatchDto,
  ) {
    const match = await this.matchService.findById(matchId);
    if (!match)
      throw new NotFoundException(`Match with id ${matchId} not found`);
    return this.matchService.updateMatchName(matchId, dto.name);
  }

  @Put('matches/:matchId/dates')
  async updateMatchDate(
    @Param('matchId') matchId: string,
    @Body() dto: UpdateMatchDto,
  ) {
    const match = await this.matchService.findById(matchId);
    if (!match)
      throw new NotFoundException(`Match with id ${matchId} not found`);
    return this.matchService.updateMatchDates(
      match._id,
      dto.startDate,
      dto.endDate,
    );
  }

  // Events
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

  @Put('matches/:matchId/events/:eventId')
  async updateEventForMatch(
    @Param('matchId') matchId: string,
    @Param('eventId') eventId: string,
    @Body() dto: UpdateEventDto,
  ) {
    const match = await this.matchService.findById(matchId);
    if (!match)
      throw new NotFoundException(`Match with id ${matchId} not found`);
    const event = await this.eventService.findById(eventId);
    if (!event)
      throw new NotFoundException(`Event with id ${eventId} not found`);
    return this.eventService.updateForMatch(dto, match._id, event._id);
  }

  @Post('matches/:matchId/events/:eventId/call')
  async callEventForMatch(
    @Param('matchId') matchId: string,
    @Param('eventId') eventId: string,
  ) {
    const match = await this.matchService.findById(matchId);
    if (!match)
      throw new NotFoundException(`Match with id ${matchId} not found`);
    const event = await this.eventService.findById(eventId);
    if (!event)
      throw new NotFoundException(`Event with id ${eventId} not found`);
    return this.eventService.callEvent(match._id, event._id);
  }

  @Post('matches/:matchId/events/:eventId/recall')
  async recallEventForMatch(
    @Param('matchId') matchId: string,
    @Param('eventId') eventId: string,
  ) {
    const match = await this.matchService.findById(matchId);
    if (!match)
      throw new NotFoundException(`Match with id ${matchId} not found`);
    const event = await this.eventService.findById(eventId);
    if (!event)
      throw new NotFoundException(`Event with id ${eventId} not found`);
    return this.eventService.recallEvent(match._id, event._id);
  }

  @Delete('matches/:matchId/events/:eventId')
  async deleteEventForMatch(
    @Param('matchId') matchId: string,
    @Param('eventId') eventId: string,
  ) {
    const match = await this.matchService.findById(matchId);
    if (!match)
      throw new NotFoundException(`Match with id ${matchId} not found`);
    const event = await this.eventService.findById(eventId);
    if (!event)
      throw new NotFoundException(`Event with id ${eventId} not found`);
    return this.eventService.deleteForMatch(match._id, event._id);
  }

  // Participants
  @Get('matches/:matchId/participants')
  async getParticipants(@Param('matchId') matchId: string) {
    const match = await this.matchService.findById(matchId);
    if (!match)
      throw new NotFoundException(`Match with id ${matchId} not found`);
    return match.players;
  }
  @Post('matches/:matchId/participants/:userId/regenerate-card')
  async participantRegenerateCard(
    @Param('matchId') matchId: string,
    @Param('userId') userId: string,
  ) {
    const match = await this.matchService.findById(matchId);
    if (!match)
      throw new NotFoundException(`Match with id ${matchId} not found`);
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);
    return this.userService.regenerateCard(user.id, match.id);
  }

  @Delete('matches/:matchId/participants/:userId')
  async deleteParticipant(
    @Param('matchId') matchId: string,
    @Param('userId') userId: string,
  ) {
    const match = await this.matchService.findById(matchId);
    if (!match)
      throw new NotFoundException(`Match with id ${matchId} not found`);
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);
    return this.matchService.removePlayer(match._id, user._id);
  }

  // Invites
  @Get('/matches/:matchId/invites')
  async getInvites(@Param('matchId') matchId: string) {
    const match = await this.matchService.findById(matchId);
    if (!match)
      throw new NotFoundException(`Match with id ${matchId} not found`);
    return this.inviteService.findByMatch(match.id);
  }
}

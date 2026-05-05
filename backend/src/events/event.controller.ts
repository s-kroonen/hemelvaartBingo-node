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
import { CreateEventDto, UpdateEventDto } from './event.schema';
import { EventService } from './event.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { IsMasterGuard } from '../auth/isMaster.guard';
@Controller({ path: 'matches/:matchId/events', version: '1' })
@UseGuards(FirebaseAuthGuard, IsMasterGuard) // Entire controller is protected
export class EventController {
  constructor(private eventService: EventService) {}
  @Get()
  async getMyMatchEvents(@Req() req) {
    return this.eventService.findByMatch(req.match._id);
  }
  @Post()
  async create(@Req() req, @Body() dto: CreateEventDto) {
    // No need to fetch match; the Guard already did it!
    return this.eventService.createForMatch(dto, req.match._id);
  }

  @Post(':eventId/call')
  async call(@Req() req, @Param('eventId') eventId: string) {
    return this.eventService.callEvent(req.match._id, eventId);
  }
  @Put(':eventId')
  async updateEventForMatch(
    @Req() req,
    @Param('eventId') eventId: string,
    @Body() dto: UpdateEventDto,
  ) {
    const event = await this.eventService.findById(eventId);
    if (!event)
      throw new NotFoundException(`Event with id ${eventId} not found`);
    return this.eventService.updateForMatch(dto, req.match._id, event._id);
  }
  @Post(':eventId/recall')
  async recallEventForMatch(@Req() req, @Param('eventId') eventId: string) {
    const event = await this.eventService.findById(eventId);
    if (!event)
      throw new NotFoundException(`Event with id ${eventId} not found`);
    return this.eventService.recallEvent(req.match._id, event._id);
  }
  @Delete(':eventId')
  async deleteEventForMatch(
    @Req() req,
    @Param('matchId') matchId: string,
    @Param('eventId') eventId: string,
  ) {
    const event = await this.eventService.findById(eventId);
    if (!event)
      throw new NotFoundException(`Event with id ${eventId} not found`);
    return this.eventService.deleteForMatch(req.match._id, event._id);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { EventRepository } from './event.repository';
import { CreateEventDto, UpdateEventDto } from './event.schema';
import { MatchService } from '../matches/match.service';

@Injectable()
export class EventService {
  constructor(
    private eventRepo: EventRepository,
    private matchService: MatchService,
  ) {}

  async findByMatch(matchId: Types.ObjectId) {
    return this.eventRepo.findByMatch(matchId);
  }

  async findById(eventId: string | Types.ObjectId) {
    return this.eventRepo.findById(eventId);
  }

  async create(data: any) {
    return this.eventRepo.create(data);
  }

  async update(id: Types.ObjectId, data: any) {
    return this.eventRepo.update(id, data);
  }

  async createForMatch(dto: CreateEventDto, matchId: string) {
    const data = {
      ...dto,
      matchId: new Types.ObjectId(matchId),
    };

    return this.eventRepo.create(data);
  }

  async updateForMatch(
    dto: UpdateEventDto,
    matchId: Types.ObjectId,
    eventId: Types.ObjectId,
  ) {
    const data = {
      ...dto,
      matchId: matchId,
    };
    return this.eventRepo.update(eventId, data);
  }

  async deleteForMatch(matchId: Types.ObjectId, eventId: Types.ObjectId) {
    return this.eventRepo.deleteForMatch(eventId, matchId);
  }
  async callEvent(matchId: Types.ObjectId, eventId: Types.ObjectId) {
    const match = await this.matchService.findById(matchId);
    const event = await this.eventRepo.findById(eventId);
    if (!event)
      throw new NotFoundException(`Event with id ${eventId} not found`);
    if (!match)
      throw new NotFoundException(`Match with id ${matchId} not found`);
    const alreadyCalled = match.calledNumbers || [];
    const numbersPerEvent = match.numbersPerEvent;

    const availableNumbers = this.getAvailableNumbers(alreadyCalled);

    const newNumbers: number[] = [];

    for (let i = 0; i < numbersPerEvent; i++) {
      if (availableNumbers.length === 0) break;

      const index = Math.floor(Math.random() * availableNumbers.length);
      const num = availableNumbers.splice(index, 1)[0];

      newNumbers.push(num);
    }
    event.called = true;

    // update match + event
    match.calledNumbers.push(...newNumbers);
    event.numbers.push(...newNumbers);

    await match.save();
    await event.save();

    return { newNumbers };
  }
  async recallEvent(matchId: Types.ObjectId, eventId: Types.ObjectId) {
    const match = await this.matchService.findById(matchId);
    const event = await this.eventRepo.findById(eventId);
    if (!event)
      throw new NotFoundException(`Event with id ${eventId} not found`);
    if (!match)
      throw new NotFoundException(`Match with id ${matchId} not found`);

    const eventNumbers = event.numbers || [];

    // remove event numbers from match.calledNumbers
    match.calledNumbers = (match.calledNumbers || [])
      .filter(n => !eventNumbers.includes(n));

    // clear event numbers
    event.numbers = [];
    event.called = false;

    await match.save();
    await event.save();

    return { removedNumbers: eventNumbers };
  }

  getAvailableNumbers(called: number[]) {
    const all = Array.from({ length: 75 }, (_, i) => i + 1);
    return all.filter((n) => !called.includes(n));
  }
}

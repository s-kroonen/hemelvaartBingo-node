import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { EventRepository } from './event.repository';
import { CreateEventDto } from './event.schema';

@Injectable()
export class EventService {
  constructor(private eventRepo: EventRepository) {}

  async findByMatch(matchId: string | Types.ObjectId) {
    return this.eventRepo.findByMatch(matchId);
  }
  async create(data: any) {
    return this.eventRepo.create(data);
  }
  async update(id: string, data: any) {
    return this.eventRepo.update(id, data);
  }

  async createForMatch(dto: CreateEventDto, matchId: string) {
    const data = {
      ...dto,
      matchId: new Types.ObjectId(matchId),
    };

    return this.eventRepo.create(data);
  }
}

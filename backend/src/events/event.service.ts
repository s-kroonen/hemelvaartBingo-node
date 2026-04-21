import {Injectable, NotFoundException} from '@nestjs/common';
import {Types} from 'mongoose';
import {EventRepository} from './event.repository';
import {CreateEventDto, UpdateEventDto} from './event.schema';

@Injectable()
export class EventService {
    constructor(private eventRepo: EventRepository) {
    }

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

    async updateForMatch(dto: UpdateEventDto, matchId: Types.ObjectId, eventId: Types.ObjectId) {
        const data = {
            ...dto,
            matchId: matchId,
        };
        return this.eventRepo.update(eventId, data);
    }

    async deleteForMatch(matchId: Types.ObjectId, eventId: Types.ObjectId) {
        return this.eventRepo.deleteForMatch(eventId, matchId);
    }


}
